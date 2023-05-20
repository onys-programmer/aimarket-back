const jwt = require('jsonwebtoken');
require('dotenv').config();

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization(' ')[1];
    if (!token) {
      throw new HttpError('Authentication failed!', 401);
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', 401);
    return next(error);
  }
};
