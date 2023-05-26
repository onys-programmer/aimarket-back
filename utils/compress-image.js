const HttpError = require("../models/http-error");
const sharp = require("sharp");

const compressImage = async (image) => {
  console.log("compressImage is running");
  const MAX_FILE_SIZE = 500 * 1024; // 500KB

  if (!image) {
    const error = new HttpError("compressImage: No image provided.", 400);
    throw error;
  }

  try {
    const compressedImageBuffer = await sharp(image.buffer)
      .resize({ width: null, height: null })
      .toBuffer({ limit: MAX_FILE_SIZE, resolveWithObject: false });
    return compressedImageBuffer;
  } catch (err) {
    const error = new HttpError(
      `compressImage: Compressing image failed, please try again. : ${err}`,
      500
    );
    throw error;
  }
};

module.exports = compressImage;
