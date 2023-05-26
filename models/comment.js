const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date },
  postId: { type: mongoose.Types.ObjectId, required: true, ref: "Post" },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Comment", commentSchema);
