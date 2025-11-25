// backend / src / services / customer.service.js;
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/apiError.js";
import httpStatus from "http-status";

export class CustomerService {
  /**
   * Lấy danh sách khách hàng (kèm tổng chi tiêu & số đơn)
   */
  static async getAllCustomers({ page = 1, limit = 20, q, status }) {
    const skip = (page - 1) * limit;
    const matchStage = { role: "customer" };

    // Logic lọc Active/Blocked
    if (status === "active") matchStage.isActive = { $ne: false };
    else if (status === "blocked") matchStage.isActive = false;

    // Logic tìm kiếm
    if (q && q.trim()) {
      const term = q.trim();
      const regex = { $regex: term, $options: "i" };
      const orConditions = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { "addresses.fullname": regex },
        { "addresses.phone": regex },
      ];
      if (mongoose.Types.ObjectId.isValid(term)) {
        orConditions.push({ _id: new mongoose.Types.ObjectId(term) });
      }
      matchStage.$or = orConditions;
    }

    const pipeline = [
      { $match: matchStage },

      // 1. Join bảng Orders
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user",
          as: "orderData",
        },
      },

      // 2. Tính toán field bổ trợ (ĐÃ SỬA LOGIC TÍNH TIỀN)
      {
        $addFields: {
          // Vẫn đếm tổng số đơn (bao gồm cả hủy/chờ để biết khách có tương tác nhiều không)
          totalOrders: { $size: "$orderData" },

          // 🔴 QUAN TRỌNG: Lọc ra danh sách các đơn ĐÃ HOÀN THÀNH
          completedOrders: {
            $filter: {
              input: "$orderData",
              as: "order",
              cond: { $eq: ["$$order.status", "completed"] }, // Chỉ lấy status = 'completed'
            },
          },

          // Lấy địa chỉ (giữ nguyên)
          defaultAddrObj: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$addresses",
                  as: "addr",
                  cond: { $eq: ["$$addr.isDefault", true] },
                },
              },
              0,
            ],
          },
          firstAddrObj: { $arrayElemAt: ["$addresses", 0] },
        },
      },

      // 3. Tính tổng tiền dựa trên danh sách ĐÃ LỌC
      {
        $addFields: {
          // Chỉ cộng dồn tiền của các đơn trong completedOrders
          totalSpent: { $sum: "$completedOrders.grandTotal" },
        },
      },

      // 4. Project hiển thị (Giữ nguyên)
      {
        $project: {
          _id: 1,
          email: 1,
          isActive: 1,
          createdAt: 1,
          totalOrders: 1,
          totalSpent: 1,

          displayName: {
            $ifNull: [
              "$name",
              "$defaultAddrObj.fullname",
              "$firstAddrObj.fullname",
              "Khách hàng",
            ],
          },

          displayPhone: {
            $switch: {
              branches: [
                {
                  case: {
                    $gt: [
                      { $strLenCP: { $ifNull: ["$defaultAddrObj.phone", ""] } },
                      0,
                    ],
                  },
                  then: "$defaultAddrObj.phone",
                },
                {
                  case: {
                    $gt: [
                      { $strLenCP: { $ifNull: ["$firstAddrObj.phone", ""] } },
                      0,
                    ],
                  },
                  then: "$firstAddrObj.phone",
                },
                {
                  case: {
                    $gt: [{ $strLenCP: { $ifNull: ["$phone", ""] } }, 0],
                  },
                  then: "$phone",
                },
              ],
              default: "",
            },
          },

          // Rank (Giữ nguyên logic)
          rank: {
            $switch: {
              branches: [
                { case: { $gte: ["$totalSpent", 100000000] }, then: "DIAMOND" },
                { case: { $gte: ["$totalSpent", 50000000] }, then: "GOLD" },
                { case: { $gte: ["$totalSpent", 10000000] }, then: "SILVER" },
              ],
              default: "MEMBER",
            },
          },
        },
      },

      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: Number(limit) }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await User.aggregate(pipeline);
    const data = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    return {
      customers: data.map((c) => ({
        ...c,
        id: c._id,
        status: c.isActive ? "active" : "blocked",
      })),
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Cập nhật thông tin khách hàng (Admin sửa)
   */
  static async updateCustomer(id, payload) {
    const customer = await User.findById(id);
    if (!customer)
      throw new ApiError(httpStatus.NOT_FOUND, "Khách hàng không tồn tại");

    // 1. Cập nhật tên và đồng bộ sang địa chỉ
    if (payload.name) {
      customer.name = payload.name;
      // Đồng bộ sang Address để hiển thị nhất quán
      if (customer.addresses && customer.addresses.length > 0) {
        customer.addresses.forEach((addr) => {
          addr.fullname = payload.name;
        });
      }
    }

    // 2. Cập nhật SĐT
    if (payload.phone) customer.phone = payload.phone;

    // 3. Cập nhật Email
    if (payload.email) customer.email = payload.email;

    await customer.save();
    return customer;
  }

  /**
   * Chặn / Mở khóa khách hàng
   */
  static async toggleBlockCustomer(id, shouldBlock) {
    const customer = await User.findById(id);
    if (!customer)
      throw new ApiError(httpStatus.NOT_FOUND, "Khách hàng không tồn tại");

    customer.isActive = !shouldBlock;
    await customer.save();
    return customer;
  }

  /**
   * Xóa khách hàng
   */
  static async deleteCustomer(id) {
    const orderCount = await Order.countDocuments({ user: id });
    if (orderCount > 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Khách hàng này đã có ${orderCount} đơn hàng. Không thể xóa (chỉ nên Chặn).`
      );
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted)
      throw new ApiError(httpStatus.NOT_FOUND, "Khách hàng không tồn tại");

    return deleted;
  }

  /**
   * Thống kê nhanh Dashboard
   */
  static async getCustomerStats() {
    const totalCustomers = await User.countDocuments({ role: "customer" });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newCustomers = await User.countDocuments({
      role: "customer",
      createdAt: { $gte: startOfMonth },
    });

    const blockedCustomers = await User.countDocuments({
      role: "customer",
      isActive: false,
    });

    return {
      totalCustomers,
      newCustomers,
      blockedCustomers,
      activeCustomers: totalCustomers - blockedCustomers,
    };
  }

  // ================= CRM FEATURES =================

  /**
   * [CRM] Lấy chi tiết khách hàng (bao gồm Notes + Populate Author)
   */
  static async getCustomerDetails(id) {
    const customer = await User.findById(id)
      .populate({
        path: "notes.author",
        select: "name email role", // Chỉ lấy info cần thiết của người viết note
      })
      .lean();

    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Khách hàng không tồn tại");
    }

    // Sắp xếp note mới nhất lên đầu
    if (customer.notes) {
      customer.notes.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    return customer;
  }

  /**
   * [CRM] Thêm ghi chú mới vào hồ sơ khách hàng
   */
  static async addNote(customerId, { content, authorId }) {
    const customer = await User.findById(customerId);
    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Khách hàng không tồn tại");
    }

    // Push note vào mảng
    customer.notes.push({
      content,
      author: authorId,
      createdAt: new Date(),
    });

    await customer.save();

    // Populate lại để trả về frontend hiển thị ngay lập tức
    await customer.populate({
      path: "notes.author",
      select: "name email role",
    });

    // Trả về danh sách notes mới nhất
    return customer.notes.sort((a, b) => b.createdAt - a.createdAt);
  }
}
