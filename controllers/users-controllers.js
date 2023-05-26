const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { name, email, password } = req.body;

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
      500
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
      401
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
    email: existingUser.email,
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

exports.signUp = signUp;
exports.login = login;
exports.changePassword = changePassword;
exports.deleteUser = deleteUser;
