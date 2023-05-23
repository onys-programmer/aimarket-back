const express = require('express');
const { check } = require('express-validator');

const {
  signUp,
  login,
} = require('../controllers/users-controllers');

const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);

module.exports = router;
