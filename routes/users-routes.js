const express = require('express');
const { check } = require('express-validator');

const {
  signUp,
  login,
} = require('../controllers/users-controllers');

const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.post(
  '/signup',
  [
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  signUp
);
router.post(
  '/login',
  [
    check('email').normalizeEmail().isEmail(),
    check('password').not().isEmpty(),
  ],
  login
);

module.exports = router;
