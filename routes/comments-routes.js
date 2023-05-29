const express = require("express");
const { check } = require("express-validator");

const {
  createComment,
  getCommentsByUserId,
  updateComment,
  deleteComment,
} = require("../controllers/comments-controllers");

const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/user/:uid", getCommentsByUserId);

router.use(checkAuth);

router.post("/", [check("content").not().isEmpty()], createComment);
router.patch("/:cid", updateComment);

router.delete("/:cid", deleteComment);

module.exports = router;
