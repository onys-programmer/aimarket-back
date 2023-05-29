const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Post = require("../models/post");
const Comment = require("../models/comment");
const generateTempPassword = require("../utils/generate-temp-password");

require("dotenv").config();

const generateToken = async (user) => {
  let token;
  try {
    token = await jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "12h" }
    );
  } catch (err) {
    const error = new HttpError(
      "generating token failed, please try again later.",
      500
    );
    return next(error);
  }
  return token;
};

const getUserById = async (req, res, next) => {
  const userId = req.params.uid;

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  console.log("errors", errors);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  console.log('signUp is running');
  const { name, email, password, memorableDate } = req.body;
  console.log(name, email, password, memorableDate);

  if (
    !email.includes('@') ||
    password.length < 6 ||
    memorableDate.length !== 8 ||
    !memorableDate.match(/^[0-9]+$/)
  ) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data.",
      422
    );
    return next(error);
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser !== null) {
    const error = new HttpError(
      `That Email is already used, please try again with other email: ${existingUser}`,
      302
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      `Failed to hash password, please try again: ${err}`,
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image:
      "https://i.pinimg.com/280x280_RS/6b/71/20/6b7120f396928249c8e50953e64d81f5.jpg",
    password: hashedPassword,
    memorableDate,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  const token = await generateToken(createdUser);

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    token: token,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log('login is running');
  console.log(email, password);
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please check your credentials and try again",
      500
    );
    return next(error);
  }

  if (existingUser === null) {
    const error = new HttpError(
      "there is no user that email, could not log you in.",
      404
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  const token = await generateToken(existingUser);
  res.json({
    userId: existingUser.id,
    name: existingUser.name,
    email: existingUser.email,
    image: existingUser.image,
    token: token,
  });
};

const changePassword = async (req, res, next) => {
  const { userId, currentPassword, newPassword } = req.body;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("Failed to fetch user.", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("User not found.", 404);
    return next(error);
  }

  let isValidPassword;
  try {
    isValidPassword = await bcrypt.compare(currentPassword, user.password);
  } catch (err) {
    const error = new HttpError("Could not compare passwords.", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Invalid password.", 401);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(newPassword, 12);
  } catch (err) {
    const error = new HttpError("Could not hash password.", 500);
    return next(error);
  }

  user.password = hashedPassword;

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError("Failed to change password.", 500);
    return next(error);
  }

  res.status(200).json({ message: "Password changed successfully." });
};

const deleteUser = async (req, res, next) => {
  const { userId } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      const error = new HttpError("User not found.", 404);
      return next(error);
    }

    await Post.deleteMany({ creator: userId });
    await Comment.deleteMany({ creator: userId });
    // Delete the user
    await user.deleteOne();

    res.status(200).json({ message: `User deleted.: ${userId}` });
    next();
  } catch (err) {
    const error = new HttpError(
      `Deleting user failed. Error: ${err.message}`,
      500
    );
    return next(error);
  }
};

const findPassword = async (req, res, next) => {
  const { email, memorableDate } = req.body;

  try {
    // 이메일로 사용자 찾기
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 기억에 남는 날짜 비교
    if (existingUser.memorableDate !== memorableDate) {
      return res.status(400).json({ message: 'Invalid memorable date' });
    }

    // 새 비밀번호 생성
    const newPassword = generateTempPassword();

    // 비밀번호 변경
    try {
      existingUser.password = await bcrypt.hash(newPassword, 12);
      await existingUser.save();
    } catch (err) {
      return res.status(500).json({ message: 'Failed to hash password' });
    }

    // 비밀번호 반환
    res.status(200).json({ password: newPassword });
  } catch (error) {
    res.status(500).json({ message: 'Failed to find password' });
  }
};


exports.getUserById = getUserById;
exports.signUp = signUp;
exports.login = login;
exports.changePassword = changePassword;
exports.deleteUser = deleteUser;
exports.findPassword = findPassword;
