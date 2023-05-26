const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String },
  posts: [{ type: mongoose.Types.ObjectId, required: true, ref: "Post" }],
  comments: [{ type: mongoose.Types.ObjectId, required: true, ref: "Comment" }],
});

userSchema.plugin(uniqueValidator);

userSchema.pre("remove", async function (next) {
  const user = this;

  // Delete user's posts
  await Post.deleteMany({ creator: user._id });

  // Delete user's comments
  await Comment.deleteMany({ creator: user._id });

  next();
});

module.exports = mongoose.model("User", userSchema);
