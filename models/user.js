const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true, maxLength: 16 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String },
  memorableDate: { type: String, required: true, length: 8 },
  posts: [{ type: mongoose.Types.ObjectId, required: true, ref: "Post", cascadeDelete: true }],
  comments: [{ type: mongoose.Types.ObjectId, required: true, ref: "Comment", cascadeDelete: true }],
});

userSchema.plugin(uniqueValidator);

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.memorableDate; // memorableDate 속성 제외
  },
});

module.exports = mongoose.model("User", userSchema);
