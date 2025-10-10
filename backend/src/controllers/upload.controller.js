// src/controllers/upload.controller.js
import { ok } from "../utils/apiResponse.js";
import { config } from "../config.js";
import { cloudinary } from "../utils/cloudinary.js";

// NOTE: cloudinary.v2 exposes utils.api_sign_request
const { utils, uploader } = cloudinary;

export const getSignedParams = async (req, res) => {
  const folder =
    req.body?.folder ||
    process.env.CLOUDINARY_UPLOAD_FOLDER ||
    `uth_store/uploads`;

  // bắt buộc phải có timestamp (giới hạn thời gian)
  const timestamp = Math.floor(Date.now() / 1000);

  // tham số nào FE sẽ gửi kèm lên Cloudinary thì tham số đó phải được ký
  const paramsToSign = { timestamp, folder };

  // tạo signature bằng api_secret
  const signature = utils.api_sign_request(
    paramsToSign,
    config.cloudinary.apiSecret
  );

  // Trả về cho FE để gọi thẳng:
  // POST https://api.cloudinary.com/v1_1/<cloudName>/auto/upload
  // form-data: file, api_key, timestamp, signature, folder
  return ok(res, {
    cloudName: config.cloudinary.cloudName,
    apiKey: config.cloudinary.apiKey,
    timestamp,
    folder,
    signature,
    // gợi ý endpoint upload
    uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/auto/upload`,
  });
};

export const deleteByPublicId = async (req, res, next) => {
  try {
    const { publicId, resourceType = "image" } = req.body;
    const result = await uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return ok(res, { result }); // { result: 'ok' } nếu xóa thành công
  } catch (e) {
    next(e);
  }
};
