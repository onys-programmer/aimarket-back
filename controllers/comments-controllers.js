const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const mongoose = require("mongoose");

const createComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        `createComment: Invalid inputs passed, please check your data}`,
        400
      )
    );
  }

  const { content, creator, postId } = req.body;

  try {
    let user;
    let post;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      user = await User.findById(creator).session(session);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      const error = new HttpError(
        `createComment: Could not find user for provided id.: ${err}`,
        404
      );
      return next(error);
    }

    try {
      post = await Post.findById(postId).session(session);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      const error = new HttpError(
        `createComment: Could not find post for provided id.: ${err}`,
        404
      );
      return next(error);
    }

    const createdComment = new Comment({
      content,
      creator,
      post: post.id,
      createdAt: new Date(),
    });

    await createdComment.save({ session });

    user.comments.push(createdComment);
    await user.save({ session });

    post.comments.push(createdComment);
    await post.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ comment: createdComment });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      `createComment: Creating comment failed, please try again. : ${err}`,
      500
    );
    return next(error);
  }
};

const getCommentsByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  const { page, perPage } = req.query;

  // 페이지와 페이지당 게시물 수를 정수로 변환합니다.
  const currentPage = parseInt(page) || 1;
  const commentsPerPage = parseInt(perPage) || 10;

  let totalComments;
  try {
    totalComments = await Comment.countDocuments();
  } catch (err) {
    const error = new HttpError(
      "Fetching comments failed, please try again later.",
      500
    );
    return next(error);
  }

  let comments;
  try {
    comments = await Comment.find({ creator: userId })
      .skip((currentPage - 1) * commentsPerPage)
      .limit(commentsPerPage);
  } catch (err) {
    const error = new HttpError(
      `getCommentsByUserId: Fetching comments failed, please try again later.: ${err}`,
      500
    );
    return next(error);
  }

  if (!comments) {
    return next(
      new HttpError("Could not find comments for the provided user id.", 404)
    );
  }

  const isLastPage = currentPage * commentsPerPage >= totalComments ? true : false;

  res.json({
    comments: comments.map((comment) => comment.toObject({ getters: true })),
    isLastPage,
  });
};

const updateComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError(
        `updateComment: Invalid inputs passed, please check your data.: ${err}`,
        422
      )
    );
  }

  const { content } = req.body;
  const commentId = req.params.cid;

  let comment;
  try {
    comment = await Comment.findById(commentId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Could not find post or user for the provided pid.",
      404
    );
    return next(error);
  }

  if (comment.creator.id !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this post.", 401);
    return next(error);
  }

  comment.content = content;
  comment.updateAt = new Date();

  try {
    await comment.save();
  } catch (err) {
    const error = new HttpError(
      `Something went wrong, could not saved updating comment.`,
      500
    );
    console.log(err);
    return next(error);
  }

  res.json({ comment: comment.toObject({ getters: true }) });
};

const deleteComment = async (req, res, next) => {
  const commentId = req.params.cid;

  let comment;
  try {
    comment = await Comment.findById(commentId)
      .populate("creator")
      .populate("post");
  } catch (err) {
    const error = new HttpError(
      "deleteComment: Could not find comment for the provided id.",
      404
    );
    return next(error);
  }

  if (!comment) {
    const error = new HttpError(
      "deleteComment: Could not find comment for this id.",
      404
    );
    return next(error);
  }

  if (comment.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "deleteComment: You are not allowed to delete this comment.",
      401
    );
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await comment.deleteOne({ session: session });

    comment.creator.comments.pull(comment);
    await comment.creator.save({ session: session });

    comment.post.comments.pull(comment);
    await comment.post.save({ session: session });

    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      `Something went wrong, could not delete comment. ${err}`,
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted comment.", cid: commentId });
};

exports.createComment = createComment;
exports.getCommentsByUserId = getCommentsByUserId;
exports.updateComment = updateComment;
exports.deleteComment = deleteComment;
