const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  creatorName: { type: String, required: true },
  content: { type: String, required: true, maxLength: 200, trim: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date },
  post: { type: mongoose.Types.ObjectId, required: true, ref: "Post" },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Comment", commentSchema);
