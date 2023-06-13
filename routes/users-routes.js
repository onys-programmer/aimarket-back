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
  changeProfileImage,
} = require("../controllers/users-controllers");

const checkAuth = require("../middleware/check-auth");
const checkProfileImageExists = require("../middleware/check-profile-image-exists");
const checkFileExtension = require("../middleware/check-file-extension");
const uploadProfileImage = require("../middleware/upload-profile-image");

const router = express.Router();

router.get("/:uid", getUserById);

router.post(
  "/signup",
  checkProfileImageExists,
  (req, res, next) => {
    if (req.file) {
      checkFileExtension(req, res, () => {
        uploadProfileImage(req, res, () => {
          next();
        });
      });
    } else {
      next();
    }
  },
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

router.patch(
  "/change-profile-image",
  checkProfileImageExists,
  checkAuth,
  (req, res, next) => {
    if (req.file) {
      checkFileExtension(req, res, () => {
        uploadProfileImage(req, res, () => {
          changeProfileImage(req, res, next);
        });
      });
    } else {
      changeProfileImage(req, res, next);
    }
  }
);

router.use(checkAuth);

router.post(
  "/check-password",
  [check("password").not().isEmpty()],
  checkPassword,
);
router.patch("/", changePassword);
router.delete("/", deleteUser);


module.exports = router;
