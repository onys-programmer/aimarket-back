const express = require("express");
const { check } = require("express-validator");

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
const uploadToS3 = require("../middleware/file-upload");

const router = express.Router();

router.get("/", getPosts);
router.get("/:pid", getPostById);
router.get("/user/:uid", getPostsByUserId);

router.use(checkAuth);

router.post(
  "/",
  [check("title").not().isEmpty()],
  checkFileExtension,
  uploadToS3,
  createPost
);
router.patch("/:pid", updatePost);
router.delete("/:pid", deletePost);

module.exports = router;
