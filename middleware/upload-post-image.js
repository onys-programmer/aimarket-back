const HttpError = require("../models/http-error");
const uploadImage = require("./upload-image");
const compressImage = require("./compress-image");

const uploadPostImage = async (req, res, next) => {
  const image = req.file;
  if (!image) {
    const error = new HttpError("uploadImage: No image provided.", 400);
    return next(error);
  }

  let compressedImageBuffer;
  try {
    compressedImageBuffer = await compressImage(image);
  } catch (err) {
    const error = new HttpError(
      `uploadPostImage: Compressing image failed, please try again. : ${err}`,
      500
    );
    return next(error);
  }

  try {
    const uploadedCompressedImageUrl = await uploadImage(
      "post-images/thumbnails",
      `thumbnail-${image.originalname}`,
      compressedImageBuffer
    );
    req.body.compressedImage = uploadedCompressedImageUrl;
  } catch (err) {
    const error = new HttpError(
      `uploadPostImage: Uploading compressed image failed, please try again. : ${err}`,
      500
    );
    return next(error);
  }

  try {
    const uploadedImageUrl = await uploadImage(
      "post-images/originals",
      image.originalname,
      image.buffer
    );
    req.body.originalImage = uploadedImageUrl;
    next();
  } catch (err) {
    const error = new HttpError(
      `uploadPostImage: Uploading image failed, please try again. : ${err}`,
      500
    );
    return next(error);
  }
};

module.exports = uploadPostImage;
