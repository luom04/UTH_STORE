// src/services/payment.service.js
import crypto from "crypto";
import qs from "qs"; // chú ý: bạn đang import querystring từ "qs"
import moment from "moment";
import { Order } from "../models/order.model.js";
import axios from "axios";
import { sendOrderConfirmationEmail } from "../utils/sendEmail.js";

class PaymentService {
  // sắp xếp object theo key A → Z
  sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
      // ⚠️ BẮT BUỘC: encode value như VNPay sample
      const value = obj[key];
      sorted[key] = encodeURIComponent(String(value)).replace(/%20/g, "+");
    }

    return sorted;
  }

  getClientIp(req) {
    let ip =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress ||
      req.ip;

    // ✅ Chuẩn hóa IPv4 cho chắc
    if (!ip) {
      ip = "127.0.0.1";
    }

    // ::ffff:192.168.1.10 => 192.168.1.10
    if (ip.includes("::ffff:")) {
      ip = ip.split("::ffff:")[1];
    }

    // ::1 (IPv6 loopback) => 127.0.0.1
    if (ip === "::1") {
      ip = "127.0.0.1";
    }

    return ip;
  }

  async createVNPayPayment(orderData, ipAddr) {
    const {
      orderId,
      amount,
      orderInfo,
      orderType = "other",
      language = "vn",
    } = orderData;

    const vnp_TmnCode = process.env.VNPAY_TMN_CODE;
    const vnp_Url = process.env.VNPAY_URL;
    const vnp_ReturnUrl = process.env.VNPAY_RETURN_URL;
    const rawSecret = process.env.VNPAY_HASH_SECRET || "";
    const vnp_HashSecret = rawSecret.trim();

    if (!vnp_TmnCode || !vnp_Url || !vnp_ReturnUrl || !vnp_HashSecret) {
      throw new Error("Missing VNPay configuration (env)");
    }

    const createDate = moment().format("YYYYMMDDHHmmss");
    // const vnp_TxnRef = orderId;
    // ✅ Tạo TxnRef duy nhất mỗi lần gọi (create + retry)
    const vnp_TxnRef = `${orderId}_${Date.now()}`;
    const vnp_Amount = Math.round(amount * 100);

    if (!vnp_TxnRef || isNaN(vnp_Amount) || vnp_Amount <= 0) {
      throw new Error("Invalid VNPay order data");
    }

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode,
      vnp_Locale: language || "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: orderType,
      vnp_Amount: vnp_Amount,
      vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      // optional:
      // vnp_ExpireDate: moment().add(15, "minutes").format("YYYYMMDDHHmmss"),
    };

    // ✅ sort + encode value chuẩn VNPay
    vnp_Params = this.sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });

    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signature = hmac.update(signData, "utf-8").digest("hex");

    vnp_Params["vnp_SecureHash"] = signature;

    const paymentUrl =
      vnp_Url + "?" + qs.stringify(vnp_Params, { encode: false });

    return {
      success: true,
      paymentUrl,
      orderId, // Mongo _id
      txnRef: vnp_TxnRef, // mã giao dịch gửi cho VNPay
    };
  }

  async verifyVNPayCallback(vnp_Params) {
    try {
      const secureHash = vnp_Params["vnp_SecureHash"];

      const rawSecret = process.env.VNPAY_HASH_SECRET || "";
      const vnp_HashSecret = rawSecret.trim(); // ✅ đồng bộ

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = this.sortObject(vnp_Params);

      const signData = qs.stringify(vnp_Params, { encode: false });

      const hmac = crypto.createHmac("sha512", vnp_HashSecret);
      const signed = hmac.update(signData, "utf-8").digest("hex");

      if (secureHash === signed) {
        const txnRef = vnp_Params["vnp_TxnRef"];
        // const orderId = vnp_Params["vnp_TxnRef"];
        const orderId = String(txnRef).split("_")[0];
        const responseCode = vnp_Params["vnp_ResponseCode"];
        const transactionNo = vnp_Params["vnp_TransactionNo"];
        const amount = vnp_Params["vnp_Amount"] / 100;
        const bankCode = vnp_Params["vnp_BankCode"];
        const payDate = vnp_Params["vnp_PayDate"];

        return {
          isValid: true,
          orderId,
          txnRef,
          responseCode,
          transactionNo,
          amount,
          bankCode,
          payDate,
          isSuccess: responseCode === "00",
        };
      } else {
        return {
          isValid: false,
          message: "Chữ ký không hợp lệ",
        };
      }
    } catch (error) {
      console.error("Error verifying VNPay callback:", error);
      throw new Error("Lỗi xác thực callback từ VNPay");
    }
  }
  // ✅ Xử lý khi VNPay thanh toán THÀNH CÔNG từ return (dùng được trên localhost)
  async handleVNPaySuccessFromReturn(verifyResult, vnp_Params) {
    const { orderId, transactionNo } = verifyResult;

    // 1) Lấy order theo _id mà bạn đã gửi vào vnp_TxnRef
    const order = await Order.findById(orderId).populate("user", "name email");

    if (!order) {
      console.warn("[VNPay RETURN] Không tìm thấy order với ID:", orderId);
      return null;
    }

    // 2) Cập nhật trạng thái thanh toán nếu chưa paid
    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.transactionId = transactionNo;
      order.paidAt = new Date();
      order.paymentDetails = {
        bankCode: vnp_Params["vnp_BankCode"],
        cardType: vnp_Params["vnp_CardType"],
        payDate: vnp_Params["vnp_PayDate"],
      };

      await order.save();
    }

    // 3) Gửi email xác nhận đơn + đã thanh toán VNPay
    if (order.user?.email) {
      await sendOrderConfirmationEmail(
        {
          orderNumber: order.orderNumber,
          items: order.items,
          itemsTotal: order.itemsTotal,
          shippingFee: order.shippingFee,
          grandTotal: order.grandTotal,
          paymentMethod: order.paymentMethod,
          couponCode: order.couponCode,
          discountAmount: order.discountAmount,
          studentDiscountAmount: order.studentDiscountAmount,
          paymentStatus: order.paymentStatus, // 👈 template có thể dùng nếu cần
        },
        { email: order.user.email, name: order.user.name }
      );
    }

    return order;
  }

  // ✅ XỬ LÝ IPN TỪ VNPAY: cập nhật đơn, hoàn stock + coupon nếu thất bại
  async handleVNPayIPN(vnp_Params) {
    try {
      const verifyResult = await this.verifyVNPayCallback(vnp_Params);

      if (!verifyResult.isValid) {
        return {
          RspCode: "97",
          Message: "Invalid signature",
        };
      }

      const { orderId, responseCode, transactionNo, amount } = verifyResult;

      const order = await Order.findById(orderId);

      if (!order) {
        return {
          RspCode: "01",
          Message: "Order not found",
        };
      }

      // Nếu đã xử lý paid rồi thì idempotent
      if (order.paymentStatus === "paid") {
        return {
          RspCode: "02",
          Message: "Order already confirmed",
        };
      }

      // Check số tiền
      if (order.grandTotal !== amount) {
        return {
          RspCode: "04",
          Message: "Invalid amount",
        };
      }

      // ✅ CASE thành công
      if (responseCode === "00") {
        order.paymentStatus = "paid";
        order.transactionId = transactionNo;
        order.paidAt = new Date();
        order.paymentDetails = {
          bankCode: vnp_Params["vnp_BankCode"],
          cardType: vnp_Params["vnp_CardType"],
          payDate: vnp_Params["vnp_PayDate"],
        };

        await order.save();

        // ✅ Gửi email "đã thanh toán VNPay thành công"
        try {
          await order.populate("user", "name email");

          await sendOrderConfirmationEmail(
            {
              orderNumber: order.orderNumber,
              items: order.items,
              itemsTotal: order.itemsTotal,
              shippingFee: order.shippingFee,
              grandTotal: order.grandTotal,
              paymentMethod: order.paymentMethod,
              couponCode: order.couponCode,
              discountAmount: order.discountAmount,
              studentDiscountAmount: order.studentDiscountAmount,
              paymentStatus: order.paymentStatus, // 👈 rất quan trọng để template biết là 'paid'
            },
            { email: order.user.email, name: order.user.name }
          );
        } catch (err) {
          console.error(
            "⚠️ [VNPay IPN] Gửi email thanh toán thành công thất bại:",
            err.message
          );
          // không throw để không làm fail IPN
        }

        return {
          RspCode: "00",
          Message: "Success",
        };
      }
    } catch (error) {
      console.error("Error handling VNPay IPN:", error);
      return {
        RspCode: "99",
        Message: "Unknown error",
      };
    }
  }

  // ===================== MOMO: TẠO THANH TOÁN =====================
  async createMoMoPayment(orderData) {
    const { orderId, amount, orderInfo } = orderData;

    // 1. Lấy config và TRIM khoảng trắng (quan trọng)
    const partnerCode = (process.env.MOMO_PARTNER_CODE || "").trim();
    const accessKey = (process.env.MOMO_ACCESS_KEY || "").trim();
    const secretKey = (process.env.MOMO_SECRET_KEY || "").trim();
    const endpoint = (process.env.MOMO_ENDPOINT || "").trim();
    const redirectUrl = (process.env.MOMO_RETURN_URL || "").trim();
    const ipnUrl = (process.env.MOMO_IPN_URL || "").trim();

    if (!partnerCode || !accessKey || !secretKey || !endpoint) {
      throw new Error("MoMo config missing in .env");
    }

    // 2. Chuẩn bị dữ liệu
    const requestId = `${partnerCode}_${Date.now()}`;
    const amountStr = String(amount); // Dùng cho chữ ký (String)
    const amountNum = Number(amount); // Dùng cho Body (Number)
    const extraData = ""; // Lưu ý: Nếu không dùng, để chuỗi rỗng
    const requestType = "captureWallet";
    const lang = "vi";

    // 3. Tạo chuỗi ký (Raw Signature) - ĐÚNG THỨ TỰ ABC
    // accessKey -> amount -> extraData -> ipnUrl -> orderId -> orderInfo -> partnerCode -> redirectUrl -> requestId -> requestType
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amountStr}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    // 4. Tạo chữ ký (Signature) bằng HMAC SHA256
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    // 5. Tạo Body request
    const requestBody = {
      partnerCode,
      partnerName: "UTH Store", // Optional: Tên hiển thị trên app MoMo
      storeId: "UTH_Store", // Optional
      requestType,
      ipnUrl,
      redirectUrl,
      orderId,
      amount: amountNum, // ✅ Gửi Number trong body
      lang,
      orderInfo,
      requestId,
      extraData,
      signature,
    };

    // --- DEBUG LOG (Xóa khi production) ---
    console.log("=== MoMo DEBUG ===");
    console.log("AccessKey:", accessKey.slice(0, 5) + "***");
    console.log("SecretKey:", secretKey.slice(0, 5) + "***");
    console.log("Raw Signature:", rawSignature);
    console.log("Hashed Signature:", signature);
    console.log("==================");

    try {
      const momoRes = await axios.post(endpoint, requestBody);

      console.log("=== MoMo RESPONSE ===");
      // console.log(momoRes.data);

      if (momoRes.data?.resultCode !== 0) {
        // MoMo trả về lỗi (ví dụ sai chữ ký, hạn mức, v.v.)
        throw new Error(
          `MoMo Error [${momoRes.data.resultCode}]: ${momoRes.data.message}`
        );
      }

      return {
        success: true,
        payUrl: momoRes.data.payUrl, // Test env trả payUrl
        deeplink: momoRes.data.deeplink || null,
        raw: momoRes.data,
      };
    } catch (error) {
      console.error("Error in createMoMoPayment:", error.message);
      // Ném lỗi ra để Controller bắt
      throw new Error(error.response?.data?.message || error.message);
    }
  }
  // ===================== MOMO: VERIFY CALLBACK (RETURN/IPN) =====================
  async verifyMoMoCallback(params) {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData = "",
      signature,
    } = params;

    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${responseTime}` +
      `&resultCode=${resultCode}` +
      `&transId=${transId}`;

    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const isValid = expectedSignature === signature;

    console.log("=== MoMo VERIFY ===");
    console.log("rawSignature:", rawSignature);
    console.log("from momo  :", signature);
    console.log("calc       :", expectedSignature);
    console.log("match      :", isValid);

    return {
      isValid,
      orderId,
      requestId,
      amount: Number(amount),
      orderInfo,
      orderType,
      transId,
      resultCode: Number(resultCode),
      message,
      payType,
      responseTime,
      extraData,
    };
  }

  // ===================== MOMO: HANDLE IPN (SERVER -> SERVER) =====================
  async handleMoMoIPN(rawBody) {
    try {
      const verify = await this.verifyMoMoCallback(rawBody);

      if (!verify.isValid) {
        return {
          resultCode: 97,
          message: "Invalid signature",
        };
      }

      const { orderId, amount, resultCode, transId, message } = verify;

      const order = await Order.findById(orderId).populate(
        "user",
        "name email"
      );

      if (!order) {
        return {
          resultCode: 1,
          message: "Order not found",
        };
      }

      // check amount cho chắc
      if (Number(order.grandTotal) !== Number(amount)) {
        return {
          resultCode: 4,
          message: "Invalid amount",
        };
      }

      // nếu đã paid rồi thì trả success luôn cho MoMo
      if (order.paymentStatus === "paid") {
        return {
          resultCode: 0,
          message: "Order already paid",
        };
      }

      if (resultCode === 0) {
        // ✅ thanh toán thành công
        order.paymentStatus = "paid";
        order.status = order.status === "pending" ? "confirmed" : order.status;
        order.paidAt = new Date();
        order.paymentDetails = {
          provider: "momo",
          transId,
          message,
        };

        await order.save({ validateModifiedOnly: true });

        // ✅ gửi mail xác nhận đặt hàng + đã thanh toán MoMo
        const user = order.user;
        if (user && user.email) {
          await sendOrderConfirmationEmail(
            {
              orderNumber: order.orderNumber,
              grandTotal: order.grandTotal,
              paymentMethod: "momo",
              items: order.items,
              itemsTotal: order.itemsTotal,
              shippingFee: order.shippingFee,
              couponCode: order.couponCode,
              discountAmount: order.discountAmount,
              studentDiscountAmount: order.studentDiscountAmount,
            },
            { email: user.email, name: user.name }
          );
        }

        return {
          resultCode: 0,
          message: "Success",
        };
      }

      // ❌ thanh toán thất bại
      order.paymentStatus = "unpaid";
      await order.save({ validateModifiedOnly: true });

      return {
        resultCode,
        message: message || "Payment failed",
      };
    } catch (err) {
      console.error("Error handleMoMoIPN:", err);
      return {
        resultCode: 99,
        message: "Unknown error",
      };
    }
  }
}

export default new PaymentService();
