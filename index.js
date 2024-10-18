require('dotenv').config();
const { checkCookies, authUser, authAdmin } = require("./middlewares/auth");
const adminRouter = require("./routes/admin");
const cookieParser = require("cookie-parser");
const mainRouter = require("./routes/main");
const userRouter = require("./routes/user");
const express = require("express");
const path = require("path");
require("./connect");

const app = express();
const PORT = process.env.PORT || 4000;

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.static(path.resolve("./public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(checkCookies("accessToken"));

app.use("/", mainRouter);
app.use("/user", authUser, userRouter);
app.use("/admin", authAdmin, adminRouter);

app.listen(PORT, () => {
  console.log(`server is running on port : ${PORT}`);
});
