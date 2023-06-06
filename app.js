require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const postsRoutes = require("./routes/posts-routes");
const commentsRoutes = require("./routes/comments-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const AdminBro = require("admin-bro");
const AdminBroExpress = require("@admin-bro/express");
const AdminBroMongoose = require("@admin-bro/mongoose");
const Post = require("./models/post");
const Comment = require("./models/comment");

// AdminBro 설정
AdminBro.registerAdapter(AdminBroMongoose);
const MyTextField = (props) => {
  const { record, property, h, context } = props;
  const value = record.params[context.field.name()];
  const lines = value.split("\n");
  const html = lines.join("<br>");
  return h().tag("div", {}, html);
};

const commentResource = {
  resource: Comment,
  options: {
    properties: {
      content: {
        type: "textarea",
        components: {
          edit: MyTextField, // 필드 커스터마이즈 등록
          show: MyTextField, // 필드 커스터마이즈 등록
        },
      },
    },
  },
};

const postResource = {
  resource: Post,
  options: {
    properties: {
      description: {
        type: "textarea",
        components: {
          edit: MyTextField, // 필드 커스터마이즈 등록
          show: MyTextField, // 필드 커스터마이즈 등록
        },
      },
    },
  },
}

const adminBro = new AdminBro({
  databases: [mongoose],
  rootPath: "/admin",
  resources: [postResource, commentResource],
});

// 관리자 계정 정보
const ADMIN = {
  email: "admin@aimarket.com",
  password: process.env.ADMIN_PASSWORD,
};

// Express 애플리케이션 생성
const app = express();

// 허용할 도메인과 포트를 명시적으로 등록
const allowedOrigins = [
  "http://localhost:3000",
  "https://localhost:3000",
  "https://aimarket365.netlify.app",
  "http://aimarket365.netlify.app",
];
app.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

// AdminBro 미들웨어 설정
const router = AdminBroExpress.buildAuthenticatedRouter(
  adminBro,
  {
    authenticate: async (email, password) => {
      if (email === ADMIN.email && password === ADMIN.password) {
        return ADMIN;
      }
      return null;
    },
    cookiePassword: process.env.COOKIE_PASSWORD,
  },
  null,
  {
    resave: false,
    saveUninitialized: true,
  }
);
app.use(adminBro.options.rootPath, router);

app.use(bodyParser.json());

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
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(
    `mongodb+srv://webdokkaebi:${process.env.MONGODB_PASSWORD}@aimarket.mo8fwdt.mongodb.net/posts?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });
