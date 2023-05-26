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

const uploadToS3 = async (req, res, next) => {
  console.log("uploadToS3 is running");
  // console.log("req", req);
  const image = req.file;
  if (!image) {
    const error = new HttpError("file-upload: No image provided.", 400);
    return next(error);
  }
  // console.log("image", image);
  const imageKey = `${uuidv4()}-${image.originalname}`;
  const fileContent = image.buffer; // Use the buffer property of the file instead of fs.readFileSync
  const uploadParams = {
    Bucket: "webdokkaebi-kmong",
    Key: `aimarket/post-images/originals/${imageKey}`,
    Body: fileContent,
  };

  try {
    const putObjectCommand = new PutObjectCommand(uploadParams);
    const s3Result = await s3Client.send(putObjectCommand);
    console.log("s3Result", s3Result);
    req.body.image = `${S3_BASE_URL}/${uploadParams.Key}`;
    console.log("uploadToS3");
    next();
  } catch (err) {
    const error = new HttpError(
      `Uploading image failed, please try again. : ${err}`,
      500
    );
    return next(error);
  }
};

module.exports = uploadToS3;
