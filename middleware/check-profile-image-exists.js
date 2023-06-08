const multer = require('multer');
const upload = multer().single('image');
const checkFileExtension = require('./check-file-extension');
const uploadProfileImage = require('./upload-profile-image');

const checkProfileImageExists = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];

  try {
    if (!token) {
      throw new HttpError('Authentication failed! Token is null', 401);
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userData = { userId: decodedToken.userId };

    upload(req, res, async (err) => {
      if (!req.file) {
        req.body.image = 'https://i.pinimg.com/280x280_RS/6b/71/20/6b7120f396928249c8e50953e64d81f5.jpg';
        return next();
      } else {
        if (err) {
          const error = new HttpError('Failed to upload image.', 500);
          return next(error);
        }
        checkFileExtension(req, res, () => {
          uploadProfileImage(req, res, () => {
            return next();
          });
        });
      }
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '토큰이 만료되었습니다.' });
    }
    return res.status(400).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = checkProfileImageExists;
