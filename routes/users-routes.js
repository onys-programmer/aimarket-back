const express = require("express");
const { check } = require("express-validator");

const {
  getUserById,
  signUp,
  login,
  findPassword,
  changePassword,
  deleteUser,
  checkPassword,
} = require("../controllers/users-controllers");

const checkAuth = require("../middleware/check-auth");
const checkProfileImageExists = require("../middleware/check-profile-image-exists");

const router = express.Router();

router.get("/:uid", getUserById);

router.post(
  "/signup",
  checkProfileImageExists,
  signUp
);
router.post(
  "/login",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").not().isEmpty(),
  ],
  login
);
router.post(
  "/find-password",
  findPassword,
)

router.use(checkAuth);

router.post(
  "/check-password",
  [check("password").not().isEmpty()],
  checkPassword,
);
router.patch("/", changePassword);
router.delete("/", deleteUser);

module.exports = router;
