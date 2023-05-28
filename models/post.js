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

// postSchema.set('toObject', {
//   transform: function (doc, ret, options) {
//     delete ret.image; // image 필드 삭제
//     return ret;
//   }
// });

module.exports = mongoose.model("Post", postSchema);
