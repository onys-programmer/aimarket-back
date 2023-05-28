const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const postsRoutes = require("./routes/posts-routes");
const commentsRoutes = require("./routes/comments-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");
require("dotenv").config();

const app = express();

// 허용할 도메인과 포트를 명시적으로 등록
const allowedOrigins = ['http://localhost:3000'];
app.use(cors({
  origin: allowedOrigins
}));


app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/posts", postsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500).json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(
    `mongodb+srv://webdokkaebi:${process.env.MONGODB_PASSWORD}@aimarket.mo8fwdt.mongodb.net/posts?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
