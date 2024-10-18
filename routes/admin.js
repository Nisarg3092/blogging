const { Router } = require("express");
const Blog = require("../model/blog");
const User = require("../model/user");
const multer = require("multer");
const router = Router();

router.get("/", async (req, res) => {
  let users = await User.find({ email: { $ne: "admin@gmail.com" } });
  return res.render("admin", {
    user: req.user,
    users: users,
  });
});

router.get("/user/:id", async (req, res) => {
  let id = req.params.id;
  let users = await User.findById(id);
  let blogs = await Blog.find({ createdBy: id });
  return res.render("userData", {
    user: req.user,
    users: users,
    blogs: blogs,
  });
});

router.post("/user/:id", async (req, res) => {
  let id = req.params.id;
  let flag = req.body;
  await Blog.findByIdAndUpdate(id,flag);
});

router.post("/chnagerole", async (req, res) => {
  let { id, role } = req.body;
  let rolldata = await User.findByIdAndUpdate(id, { role: role });
});

router.post("/chnageaccess", async (req, res) => {
  let { id, access } = req.body;
  let rolldata = await User.findByIdAndUpdate(id, { access: access });
});

module.exports = router;
