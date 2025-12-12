//src/controllers/payment.controller.js
import paymentService from "../services/payment.service.js";
import { OrderService } from "../services/order.service.js";

class PaymentController {
  // Tạo thanh toán VNPay
  async createVNPayPayment(req, res) {
    try {
      const { shippingInfo, note, couponCode } = req.body;
      const userId = req.user._id;

      const orderData = {
        shippingAddress: {
          fullname: shippingInfo.fullName,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          line2: shippingInfo.line2 || "",
          ward:
            typeof shippingInfo.ward === "object"
              ? shippingInfo.ward
              : { name: shippingInfo.ward },
          district:
            typeof shippingInfo.district === "object"
              ? shippingInfo.district
              : { name: shippingInfo.district },
          province:
            typeof shippingInfo.city === "object"
              ? shippingInfo.city
              : { name: shippingInfo.city },
        },
        paymentMethod: "vnpay",
        note: note || "",
        couponCode: couponCode || undefined,
      };

      // Tạo order trong database
      const order = await OrderService.createOrder(userId, orderData);

      // ✅ FIX: Lấy orderNumber (KHÔNG phải orderCode)
      await order.populate("user", "name email");
      const orderNumber = order.orderNumber || order._id.toString();

      console.log("✅ Order created:", {
        _id: order._id,
        orderNumber: orderNumber,
        grandTotal: order.grandTotal,
      });

      // Lấy IP của client
      const ipAddr = paymentService.getClientIp(req);

      // ✅ Bỏ dấu tiếng Việt
      const removeVietnameseTones = (str) => {
        return str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D");
      };

      // ✅ FIX: Dùng orderNumber
      const orderInfo = removeVietnameseTones(
        `Thanh toan don hang ${orderNumber}`
      );

      // Tạo URL thanh toán VNPay
      const paymentData = {
        orderId: order._id.toString(),
        amount: order.grandTotal,
        orderInfo: orderInfo, // ✅ Đã bỏ dấu và dùng orderNumber
        orderType: "billpayment",
      };

      const paymentResult = await paymentService.createVNPayPayment(
        paymentData,
        ipAddr
      );

      res.status(200).json({
        success: true,
        message: "Tạo thanh toán VNPay thành công",
        order: {
          _id: order._id,
          orderNumber: orderNumber, // ✅ Đổi từ orderCode -> orderNumber
          totalAmount: order.grandTotal,
        },
        paymentUrl: paymentResult.paymentUrl,
      });
    } catch (error) {
      console.error("Error in createVNPayPayment:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi tạo thanh toán VNPay",
      });
    }
  }

  // Xử lý return từ VNPay (sau khi user thanh toán)
  async vnpayReturn(req, res) {
    try {
      const vnp_Params = req.query;
      const verifyResult = await paymentService.verifyVNPayCallback(vnp_Params);

      const CLIENT_RETURN_URL = `${process.env.CLIENT_URL}/checkout/success`;

      if (!verifyResult.isValid) {
        return res.redirect(
          `${CLIENT_RETURN_URL}?success=false&method=vnpay&message=Invalid signature`
        );
      }

      if (verifyResult.isSuccess) {
        // ✅ Thanh toán thành công: nhờ service xử lý hết (update + gửi mail)
        try {
          await paymentService.handleVNPaySuccessFromReturn(
            verifyResult,
            vnp_Params
          );
        } catch (err) {
          console.error(
            "⚠️ [VNPay RETURN] Lỗi khi xử lý success:",
            err.message
          );
          // không throw để tránh làm hỏng redirect
        }

        // Redirect về FE báo thành công
        return res.redirect(
          `${CLIENT_RETURN_URL}?success=true&method=vnpay&orderId=${verifyResult.orderId}&transactionNo=${verifyResult.transactionNo}`
        );
      }

      // ❌ Thanh toán thất bại
      return res.redirect(
        `${CLIENT_RETURN_URL}?success=false&method=vnpay&orderId=${verifyResult.orderId}&message=Payment failed`
      );
    } catch (error) {
      console.error("Error in vnpayReturn:", error);
      const CLIENT_RETURN_URL = `${process.env.CLIENT_URL}/checkout/success`;
      return res.redirect(
        `${CLIENT_RETURN_URL}?success=false&method=vnpay&message=Error processing payment`
      );
    }
  }

  // Xử lý IPN từ VNPay (webhook)
  async vnpayIPN(req, res) {
    try {
      const vnp_Params = req.query;

      const result = await paymentService.handleVNPayIPN(vnp_Params);

      res.status(200).json(result);
    } catch (error) {
      console.error("Error in vnpayIPN:", error);
      res.status(200).json({
        RspCode: "99",
        Message: "Unknown error",
      });
    }
  }

  // ✅ Retry thanh toán VNPay cho đơn đã tạo nhưng chưa thanh toán
  async retryVNPayPayment(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user._id;

      // 1) Lấy đơn hàng theo service, có kiểm tra chủ sở hữu
      //    Dùng lại getOrderById để đảm bảo chỉ lấy được đơn của chính user
      const order = await OrderService.getOrderById(orderId, userId);

      // 2) Kiểm tra phương thức thanh toán
      const method = (order.paymentMethod || "").toLowerCase();
      if (method !== "vnpay") {
        return res.status(400).json({
          success: false,
          message: "Đơn hàng này không sử dụng thanh toán VNPay",
        });
      }

      // 3) Đơn đã thanh toán thì không cho retry
      if (order.paymentStatus === "paid") {
        return res.status(400).json({
          success: false,
          message: "Đơn hàng này đã được thanh toán",
        });
      }

      // 4) Đơn đã huỷ / hết hạn thì không cho thanh toán lại
      if (["canceled", "expired"].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: "Đơn hàng đã bị huỷ hoặc hết hạn",
        });
      }

      const ipAddr = paymentService.getClientIp(req);

      // Hàm bỏ dấu tiếng Việt (copy từ trên để dùng lại)
      const removeVietnameseTones = (str) =>
        str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D");

      const orderInfo = removeVietnameseTones(
        `Thanh toan don hang ${order.orderNumber || order._id}`
      );

      // 5) Gọi xuống service để tạo URL thanh toán mới
      const paymentData = {
        orderId: order._id.toString(),
        amount: order.grandTotal,
        orderInfo,
        orderType: "billpayment",
      };

      const paymentResult = await paymentService.createVNPayPayment(
        paymentData,
        ipAddr
      );

      return res.json({
        success: true,
        message: "Tạo lại phiên thanh toán VNPay thành công",
        paymentUrl: paymentResult.paymentUrl,
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.grandTotal,
          paymentStatus: order.paymentStatus,
          status: order.status,
        },
      });
    } catch (error) {
      console.error("Error in retryVNPayPayment:", error);
      // Nếu OrderService ném ApiError 404 thì vẫn nhảy vào đây → trả 500.
      // Bạn có thể refine thêm nếu muốn bắt riêng.
      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi tạo lại thanh toán VNPay",
      });
    }
  }

  // ======================= MoMo: Tạo thanh toán =======================
  async createMoMoPayment(req, res) {
    try {
      const { shippingInfo, note, couponCode } = req.body;
      const userId = req.user._id;

      // Tạo order giống VNPay
      const orderData = {
        shippingAddress: {
          fullname: shippingInfo.fullName,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          line2: shippingInfo.line2 || "",
          ward:
            typeof shippingInfo.ward === "object"
              ? shippingInfo.ward
              : { name: shippingInfo.ward },
          district:
            typeof shippingInfo.district === "object"
              ? shippingInfo.district
              : { name: shippingInfo.district },
          province:
            typeof shippingInfo.city === "object"
              ? shippingInfo.city
              : { name: shippingInfo.city },
        },
        paymentMethod: "momo",
        note: note || "",
        couponCode: couponCode || undefined,
      };

      const order = await OrderService.createOrder(userId, orderData);
      await order.populate("user", "name email");

      const orderId = order._id.toString();

      // Chuẩn hóa orderInfo không dấu
      const removeVietnameseTones = (str) =>
        str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D");

      const orderInfo = removeVietnameseTones(
        `Thanh toan don hang ${order.orderNumber}`
      );

      const momoResult = await paymentService.createMoMoPayment({
        orderId,
        amount: order.grandTotal,
        orderInfo,
      });

      return res.status(200).json({
        success: true,
        message: "Tạo thanh toán MoMo thành công",
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.grandTotal,
        },
        payUrl: momoResult.payUrl,
      });
    } catch (error) {
      console.error("Error in createMoMoPayment:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi tạo thanh toán MoMo",
      });
    }
  }
  // ======================= MoMo: RETURN =======================
  async momoReturn(req, res) {
    try {
      const verifyResult = await paymentService.verifyMoMoCallback(req.query);

      const CLIENT_RETURN_URL = `${process.env.CLIENT_URL}/checkout/success`;

      if (!verifyResult.isValid) {
        return res.redirect(
          `${CLIENT_RETURN_URL}?success=false&method=momo&message=Invalid-signature`
        );
      }

      // resultCode = 0 → thanh toán thành công
      if (verifyResult.resultCode === 0) {
        try {
          await paymentService.handleMoMoIPN(req.query); // dùng chung IPN handler
        } catch (err) {
          console.error("MoMo RETURN handle error:", err.message);
        }

        return res.redirect(
          `${CLIENT_RETURN_URL}?success=true&method=momo&orderId=${verifyResult.orderId}&transId=${verifyResult.transId}`
        );
      }

      // Thất bại
      return res.redirect(
        `${CLIENT_RETURN_URL}?success=false&method=momo&orderId=${verifyResult.orderId}&message=${verifyResult.message}`
      );
    } catch (error) {
      console.error("Error in momoReturn:", error);
      const CLIENT_RETURN_URL = `${process.env.CLIENT_URL}/checkout/success`;

      return res.redirect(
        `${CLIENT_RETURN_URL}?success=false&method=momo&message=Error-processing-payment`
      );
    }
  }
  // ======================= MoMo: IPN =======================
  async momoIPN(req, res) {
    try {
      const result = await paymentService.handleMoMoIPN(req.body);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in momoIPN:", error);
      return res.status(200).json({
        resultCode: 99,
        message: "Unknown error",
      });
    }
  }
}

export default new PaymentController();
