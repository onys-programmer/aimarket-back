const { v4: uuidv4 } = require("uuid");
const HttpError = require("../models/http-error");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const S3_BASE_URL = "https://webdokkaebi-kmong.s3.ap-northeast-2.amazonaws.com";
const s3Client = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadImage = async (directory, imageName, imageBuffer) => {
  // console.log("uploadImage is running", directory);
  // console.log("req", req);
  if (!directory) {
    const error = new HttpError("uploadImage: No directory provided.", 400);
    throw error;
  }
  if (!imageName || !imageBuffer) {
    // console.log("imageName", imageName, "imageBuffer", imageBuffer);
    const error = new HttpError("uploadImage: No image provided.", 400);
    throw error;
  }
  // console.log("image", image);
  const imageKey = `${uuidv4()}-${imageName}`;
  const fileContent = imageBuffer; // Use the buffer property of the file instead of fs.readFileSync
  const uploadParams = {
    Bucket: "webdokkaebi-kmong",
    Key: `aimarket/${directory}/${imageKey}`,
    Body: fileContent,
    ACL: "public-read",
  };

  try {
    const putObjectCommand = new PutObjectCommand(uploadParams);
    await s3Client.send(putObjectCommand);
    const imageUrl = `${S3_BASE_URL}/${uploadParams.Key}`;
    return imageUrl;
  } catch (err) {
    const error = new HttpError(
      `uploadImage: Uploading image failed, please try again. : ${err}`,
      500
    );
    throw error;
  }
};

module.exports = uploadImage;
