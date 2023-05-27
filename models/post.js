const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  thumbnail: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  comments: [{ type: mongoose.Types.ObjectId, ref: "Comment", cascadeDelete: true }],
});

module.exports = mongoose.model("Post", postSchema);
