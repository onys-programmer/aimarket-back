const HttpError = require("../models/http-error");
const uploadImage = require("../utils/upload-image");
const compressImage = require("../utils/compress-image");

const uploadProfileImage = async (req, res, next) => {
  const image = req.file;
  if (!image) {
    const error = new HttpError("uploadProfileImage: No image provided.", 400);
    return next(error);
  }

  let compressedImageBuffer;
  try {
    compressedImageBuffer = await compressImage(image, 100);
  } catch (err) {
    const error = new HttpError(
      `uploadProfileImage: Compressing image failed, please try again. : ${err}`,
      500
    );
    return next(error);
  }

  try {
    const uploadedCompressedImageUrl = await uploadImage(
      "user/profile-images",
      `profile-image-${image.originalname}`,
      compressedImageBuffer
    );
    req.body.image = uploadedCompressedImageUrl;
    return next();
  } catch (err) {
    const error = new HttpError(
      `uploadProfileImage: Uploading compressed image failed, please try again. : ${err}`,
      500
    );
    return next(error);
  }
};

module.exports = uploadProfileImage;
