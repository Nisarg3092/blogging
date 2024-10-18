const { Router } = require("express");
const User = require("../model/user");
const Blog = require("../model/blog");
const CommentLike = require("../model/commentLike");
const Comment = require("../model/comment");
const multer = require("multer");
const router = Router();


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./public/uploads/`);
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/blogs", async (req, res) => {
  const allBlog = await Blog.find({ createdBy: req.user._id });
  res.render("userBlog", {
    user: req.user,
    blogs: allBlog,
  });
});

router.get("/add-blog", (req, res) => {
  res.render("addBlog", {
    user: req.user,
  });
});

router.get("/draft-blog", async (req, res) => {
  const allBlog = await Blog.find({ createdBy: req.user._id, draft: true });
  res.render("draft", {
    user: req.user,
    blogs: allBlog,
  });
});

router.get("/profile", async (req, res) => {
  let userDeatil = await User.findById(req.user._id);
  let blogs = await Blog.find({createdBy:userDeatil._id, draft: false});
  res.render("profile", {
    user: userDeatil,
    blogs:blogs
  });
});

router.get("/profile/picture", async (req, res) =>{
  let userDeatil = await User.findById(req.user._id);
  res.render("profileUpdate", {
    user: userDeatil,
    image : true
  });
});

router.get("/profile/name", async (req, res) =>{
  let userDeatil = await User.findById(req.user._id);
  res.render("profileUpdate", {
    user: userDeatil,
    name : true
  });
});

router.get("/profile/email", async (req, res) =>{
  let userDeatil = await User.findById(req.user._id);
  res.render("profileUpdate", {
    user: userDeatil,
    email : true
  });
});

router.post("/add-blog", upload.single("CoverImage"), async (req, res) => {
  const { action, title, body } = req.body;
  let is_draft = false;
  let flag = true;
  if (action === "draft") {
    is_draft = true;
    flag = false;
  }

  if (req.file === undefined) {
    await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      draft: is_draft,
      flag: flag,
    });
    return res.redirect("/");
  }
  await Blog.create({
    title,
    body,
    createdBy: req.user._id,
    coverImage: `uploads/${req.file.filename}`,
    draft: is_draft,
    flag: flag,
  });
  return res.redirect("/");
});

router.post("/draft-blog", upload.single("CoverImage"), async (req, res) => {
  let { action, blogId, title, body } = req.body;
  if (action === "delete") {
    await Blog.findByIdAndDelete(blogId);
    return res.redirect("/user/draft-blog");
  }
  if (req.file === undefined) {
    const blog = await Blog.findByIdAndUpdate(blogId, {
      title,
      body,
      draft: false,
      flag: true,
    });
    return res.redirect("/user/draft-blog");
  }
  const blog = await Blog.findByIdAndUpdate(blogId, {
    title,
    body,
    coverImage: `uploads/${req.file.filename}`,
    draft: false,
    flag: true,
  });
  return res.redirect("/user/draft");
});

router.post("/update-blog", upload.single("CoverImage"), async (req, res) => {
  let {  flag, blogId, title, body } = req.body;
  flag = Boolean(flag);
  if (req.file === undefined) {
    const blog = await Blog.findByIdAndUpdate(blogId, {
      title,
      body,
      flag: flag,
    });
    return res.redirect("/user/blogs");
  }
  const blog = await Blog.findByIdAndUpdate(blogId, {
    title,
    body,
    coverImage: `uploads/${req.file.filename}`,
    flag: flag,
  });
  return res.redirect("/user/blogs");
});

router.post("/profile", async (req, res) => {
  const { old_password, new_password, email } = req.body;
  let { user, match} = await User.checkPass(email, old_password);
  if(match === false) {
    return res.render("profile", {
      user: user,
      error: 'Password Not match'
    });
  }
    user.password = new_password;
    await user.save();
    return res.render("profile", {
      user: user,
       message: 'Password changed successfully!'
    });
});

router.post("/profile/picture", upload.single("CoverImage"), async (req,res) =>{
  let { id } = req.body;
  console.log(`/uploads/${req.file.filename}`)
  await User.findByIdAndUpdate(id, {
    $set: { profileImage: `uploads/${req.file.filename}` }  
  }, { new: true }); 

  return res.redirect("/user/profile");

});

router.post("/profile/name", async (req,res) =>{
  let { id, fullname } = req.body;
  await User.findByIdAndUpdate(id, {
    $set: { fullname }  
  }, { new: true }); 
  return res.redirect("/user/profile");
});

router.post("/profile/email", async (req,res) =>{
  let { id, email } = req.body;
  let ans = await User.findByIdAndUpdate(id, {
    $set: { email }  
  }, { new: true }); 
  return res.redirect("/user/profile");
});

router.put("/comment/display", async (req,res) =>{
  const { id, flag } = req.body;
  try {
    const comment = await Comment.findById(id);
    comment.flag = flag;
    await comment.save()
  } catch (error) {
    console.log(error) 
  }
});

router.post("/comment/likes", async (req,res) =>{
  const { id, likeAdd } = req.body;
  console.log(req.body);
  try {
    if(likeAdd){
      console.log("done");
      await CommentLike.create({
        commentId: id,
        userId: req.user._id
      })
    }
    else{
      console.log("done1");
      await CommentLike.deleteOne({commentId: id,
        userId: req.user._id})
    }
  } catch (error) {
    console.log(error) 
  }
});

module.exports = router;


