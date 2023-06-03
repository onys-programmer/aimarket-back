const checkFileExtension = require("./check-file-extension");
const uploadPostImage = require("./upload-post-image");
const Post = require("../models/post");

const checkImageExists = async (req, res, next) => {
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
};

module.exports = checkImageExists;
