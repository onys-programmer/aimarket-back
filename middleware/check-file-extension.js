const checkFileExtension = (req, res, next) => {
  const image = req.file;

  if (!image) {
    return next(new Error("checkFileExtension: No image provided."));
  }
  // 업로드된 파일의 확장자 추출
  const fileExtension = image.originalname.split(".").pop();

  const ALLOWED_EXTENSIONS = ["png", "jpeg", "jpg"];
  // 허용된 확장자인지 확인
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return next(
      new HttpError(
        "Invalid file type. Only png, jpeg, and jpg files are allowed.",
        422
      )
    );
  }

  // console.log("checkFileExtension", image);
  // 허용된 확장자일 경우 다음 미들웨어로 제어를 넘깁니다.
  next();
};

module.exports = checkFileExtension;
