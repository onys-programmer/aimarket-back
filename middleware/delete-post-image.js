const HttpError = require("../models/http-error");
const Post = require("../models/post");
const deleteImage = require("../utils/delete-image");

const deletePostImage = async (req, res, next) => {
  const postId = req.params.pid;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new HttpError("deletePostImage: Could not find post for this id.", 404);
      return next(error);
    }

    const imagePath = post.image;
    const thumbnailPath = post.thumbnail;

    try {
      await deleteImage(imagePath);
      await deleteImage(thumbnailPath);
    } catch (err) {
      const error = new HttpError(`deletePostImage: Could not delete image.: ${err}`, 500);
      return next(error);
    }

    // console.log("Image deleted successfully");
    next();
  } catch (err) {
    console.error("Error deleting image:", err);
    next(new Error("Failed to delete image"));
  }
};

module.exports = deletePostImage;
