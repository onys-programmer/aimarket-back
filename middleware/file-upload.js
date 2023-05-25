const uploadToS3 = async (req, res, next) => {
  if (!req.file) {
    return next(new Error("No image provided."));
  }

  const imageKey = `${uuidv4()}-${image.originalname}`;
  const fileContent = image.buffer; // Use the buffer property of the file instead of fs.readFileSync
  const uploadParams = {
    Bucket: "webdokkaebi-kmong",
    Key: `aimarket/post-images/originals/${imageKey}`,
    Body: fileContent,
  };

  try {
    const s3Result = await s3.upload(uploadParams).promise();
    req.body.image = s3Result.Location;
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
