const multer = require('multer');
const upload = multer().single('image');

const checkFileExtension = require("./check-file-extension");
const uploadPostImage = require("./upload-post-image");
const Post = require("../models/post");

const checkImageExists = (req, res, next) => {
  // 이미지 파일 처리
  upload(req, res, async (err) => {
    if (err) {
      // 업로드 오류 처리
      const error = new HttpError("Failed to upload image.", 500);
      return next(error);
    }

    const image = req.file;

    if (!image) {
      let post;
      try {
        post = await Post.findById(req.params.pid);
      } catch (err) {
        const error = new HttpError(
          "checkImageExists: Something went wrong, could not find a post.",
          500
        );
        return next(error);
      }
      req.body.originalImage = post.image;
      req.body.compressedImage = post.thumbnail;
      return next();
    } else {
      checkFileExtension(req, res, () => {
        uploadPostImage(req, res, () => {
          return next();
        });
      });
    }
  });
};

module.exports = checkImageExists;
