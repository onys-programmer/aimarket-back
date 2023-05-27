const express = require("express");
const { check } = require("express-validator");
const multer = require("multer");
const upload = multer();

const {
  createPost,
  getPosts,
  getPostById,
  getPostsByUserId,
  updatePost,
  deletePost,
} = require("../controllers/posts-controllers");

const checkAuth = require("../middleware/check-auth");
const checkFileExtension = require("../middleware/check-file-extension");
const uploadPostImage = require("../middleware/upload-post-image");
const deletePostImage = require("../middleware/delete-post-image");

const router = express.Router();

router.get("/", getPosts);
router.get("/:pid", getPostById);
router.get("/user/:uid", getPostsByUserId);

router.use(checkAuth);

router.post(
  "/",
  [check("title").not().isEmpty()],
  upload.single("image"),
  checkFileExtension,
  uploadPostImage,
  createPost
);
router.patch("/:pid", updatePost);
router.delete("/:pid", deletePostImage, deletePost);

module.exports = router;
