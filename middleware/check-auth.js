const jwt = require('jsonwebtoken');
require('dotenv').config();

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  console.log('check auth is running');
  try {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      console.log('Authentication failed! token is null');
      throw new HttpError('Authentication failed! token is null', 401);
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userData = { userId: decodedToken.userId };

    console.log('check auth successed');
    next();
  } catch (err) {
    console.log('Authentication failed!: ', JSON.stringify(err));

    console.log('err.name: ', err.name);

    if (err.name === 'TokenExpiredError') {
      console.log("this is token expired error");
      // 토큰이 만료된 경우 401 Unauthorized 응답 전송
      return res.status(401).json({ message: '토큰이 만료되었습니다.' });
    }

    // 다른 유효하지 않은 토큰인 경우 400 Bad Request 등의 에러 전송
    return res.status(400).json({ message: '유효하지 않은 토큰입니다.' });
  }
};
