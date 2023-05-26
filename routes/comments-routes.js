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

router.use(checkAuth);

router.get("/user/:uid", getCommentsByUserId);

router.post("/", [check("content").not().isEmpty()], createComment);
router.patch("/:cid", updateComment);

router.delete("/:cid", deleteComment);

module.exports = router;
