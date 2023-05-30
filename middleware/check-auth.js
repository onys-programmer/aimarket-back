const jwt = require("jsonwebtoken");
require("dotenv").config();

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  console.log("check auth is running");
  try {
    // console.log(req.headers);
    const token = req.headers.authorization.split(" ")[1];
    // console.log('token', token);

    if (!token) {
      console.log("Authentication failed! token is null");
      throw new HttpError("Authentication failed! token is null", 401);
    }
    // console.log('token', token);
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log('decodedToken', decodedToken);
    req.userData = { userId: decodedToken.userId };
    // console.log('check auth', req.userData);
    next();
  } catch (err) {
    console.log("Authentication failed!: ", err);
    const error = new HttpError(`Authentication failed!: ${err}`, 401);
    return next(error);
  }
};
