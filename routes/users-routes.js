const express = require("express");
const { check } = require("express-validator");

const {
  getUserById,
  signUp,
  login,
  findPassword,
  changePassword,
  deleteUser,
} = require("../controllers/users-controllers");

const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:uid", getUserById);

router.post(
  "/signup",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
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

router.patch("/", changePassword);
router.delete("/", deleteUser);

module.exports = router;
