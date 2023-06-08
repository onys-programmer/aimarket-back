const multer = require('multer');
const upload = multer().single('image');
const checkFileExtension = require('./check-file-extension');
const uploadProfileImage = require('./upload-profile-image');

const checkProfileImageExists = (req, res, next) => {
  upload(req, res, async (err) => {
    // console.log("checkProfileImageExists is running");
    if (!req.file) {
      // 프로필 이미지가 없는 경우 기본 이미지 URL을 설정합니다.
      req.body.image = "https://i.pinimg.com/280x280_RS/6b/71/20/6b7120f396928249c8e50953e64d81f5.jpg";
      return next();
    } else {
      if (err) {
        // 업로드 오류 처리
        const error = new HttpError("Failed to upload image.", 500);
        return next(error);
      }
      checkFileExtension(req, res, () => {
        uploadProfileImage(req, res, () => {
          return next();
        });
      });
    }
  });
}

module.exports = checkProfileImageExists;
