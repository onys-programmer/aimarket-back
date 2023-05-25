const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Post = require("../models/post");
const User = require("../models/user");
const mongoose = require("mongoose");

const createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, image, creator } = req.body;

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const createdPost = new Post({
      title,
      description,
      image,
      creator,
    });

    await createdPost.save({ session: session });
    user.posts.push(createdPost);
    await user.save({ session: session });
    await session.commitTransaction();

    res.json({ post: createdPost });
  } catch (err) {
    const error = new HttpError(
      `Creating post failed, please try again. : ${err}`,
      500
    );
    return next(error);
  }
};

const getPostById = async (req, res, next) => {
  const postId = req.params.pid;
  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a post.",
      500
    );
    return next(error);
  }
  if (!post) {
    const error = new HttpError(
      "Could not find a post for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ post: post.toObject({ getters: true }) });
};

const getPosts = async (req, res, next) => {
  let posts;
  try {
    posts = await Post.find();
  } catch (err) {
    const error = new HttpError(
      "Fetching posts failed, please try again later.",
      500
    );
    return next(error);
  }
  if (!posts) {
    return next(new HttpError("Could not find posts.", 404));
  }

  res.json({ posts: posts.map((post) => post.toObject({ getters: true })) });
};

const getPostsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let posts;
  try {
    posts = await Post.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Fetching posts failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!posts || posts.length === 0) {
    return next(
      new HttpError("Could not find posts for the provided user id.", 404)
    );
  }

  res.json({ posts: posts.map((post) => post.toObject({ getters: true })) });
};

const updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, image, description } = req.body;
  const postId = req.params.pid;

  let post;
  try {
    post = await Post.findById(postId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Could not find post or user for the provided pid.",
      404
    );
    return next(error);
  }

  if (post.creator.id !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this post.", 401);
    return next(error);
  }

  post.title = title;
  post.image = image;
  post.description = description;

  try {
    await post.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not saved updating post.",
      500
    );
    return next(error);
  }

  res.json({ post: post.toObject({ getters: true }) });
};

const deletePost = async (req, res, next) => {
  const postId = req.params.pid;
  let post;

  try {
    post = await Post.findById(postId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Could not find post for the provided id.",
      404
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError("Could not find post for this id.", 404);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await post.remove({ session: session });
    post.creator.posts.pull(post);
    await post.creator.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      `Something went wrong, could not delete post. ${err}`,
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted post.", pid: postId });
};

exports.createPost = createPost;
exports.getPosts = getPosts;
exports.getPostById = getPostById;
exports.getPostsByUserId = getPostsByUserId;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
