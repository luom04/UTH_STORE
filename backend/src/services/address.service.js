import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";

export const AddressService = {
  async getAll(userId) {
    const user = await User.findById(userId).select("addresses");
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    return user.addresses;
  },

  async add(userId, payload) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    // nếu new addr là default -> bỏ default cũ
    if (payload.isDefault) user.addresses.forEach((a) => (a.isDefault = false));

    user.addresses.push(payload);
    await user.save();
    return user.addresses;
  },

  async update(userId, addrId, payload) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    const addr = user.addresses.id(addrId);
    if (!addr) throw new ApiError(httpStatus.NOT_FOUND, "Address not found");

    if (payload.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    Object.assign(addr, payload);

    await user.save();
    return user.addresses;
  },

  async remove(userId, addrId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    const sub = user.addresses.id(addrId);
    if (!sub) throw new ApiError(httpStatus.NOT_FOUND, "Address not found");
    sub.deleteOne();

    await user.save();
    return user.addresses;
  },

  async setDefault(userId, addrId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    let found = false;
    user.addresses.forEach((a) => {
      const isThis = a._id.toString() === addrId;
      a.isDefault = isThis;
      if (isThis) found = true;
    });
    if (!found) throw new ApiError(httpStatus.NOT_FOUND, "Address not found");

    await user.save();
    return user.addresses;
  },
};
