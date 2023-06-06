const HttpError = require("../models/http-error");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const deleteImage = async (imageUrl) => {
  try {
    console.log(imageUrl, "imageUrl");
    const imageUrlArray = imageUrl.split("/");
    const bucketName = imageUrlArray[2].split(".")[0];
    const key = imageUrlArray.slice(3).join("/");
    // console.log("bucketName", bucketName, "key", key);
    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };

    console.log("deleteParams", deleteParams)
    const deleteObjectCommand = new DeleteObjectCommand(deleteParams);
    await s3Client.send(deleteObjectCommand);

    console.log("Image deleted successfully");
  } catch (err) {
    console.error("Error deleting image:", err);
    const error = new HttpError("Failed to delete image");
    next(error);
  }
};

module.exports = deleteImage;
