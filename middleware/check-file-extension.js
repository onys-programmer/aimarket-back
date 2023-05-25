const checkFileExtension = (req, res, next) => {
  // 업로드된 파일의 확장자 추출
  const fileExtension = req.file.originalname.split(".").pop();

  // 허용된 확장자인지 확인
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return next(
      new HttpError(
        "Invalid file type. Only png, jpeg, and jpg files are allowed.",
        422
      )
    );
  }

  // 허용된 확장자일 경우 다음 미들웨어로 제어를 넘깁니다.
  next();
};

module.exports = checkFileExtension;
