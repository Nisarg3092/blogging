const { Router } = require("express");
const User = require("../model/user");
const Blog = require("../model/blog");
const Comment = require("../model/comment");
const CommentLike = require("../model/commentLike");
const OTP = require("../model/otp");
const router = Router();
const { sendOtpMail, generateOTP } = require("../utils/nodemailer")
const { authHome } = require("../middlewares/auth");
const {
  createAccessToken,
  checkTokenR,
  createRefreshToken,
} = require("../services/auth");
const { compile } = require("ejs");

const options = {
  httpOnly: true,
  secure: true,
};

router.get("/", authHome, async (req, res) => {
  const allBlog = await Blog.find({ draft: false, flag: true });
  res.render("home", {
    user: req.user,
    blogs: allBlog,
  });
});

router.get("/readblog/:id", authHome, async (req, res) => {
  const id = req.params.id;
  const blog = await Blog.findById(id).populate("createdBy");
  const comment = await Comment.find({ blogId: id }).populate("createdBy");

  let commentLike = {};

  for (const com of comment) {
    const datas = await CommentLike.find({ commentId: com._id });

    commentLike[com._id] = {
      userIds: [],
      likeCount: 0 
    };
    if (datas && datas.length > 0) {
      commentLike[com._id].userIds = datas.map(data => data.userId);
      commentLike[com._id].likeCount = datas.length;
    }
  }
 res.render("readBlog", {
    user: req.user,
    blogs: blog,
    comments: comment,
    likes: commentLike
  });
});

router.get("/signin", (req, res) => {
  res.render("signin");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signin", async (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase();
  try {
    const { accessToken, refreshToken } = await User.matchPassword(
      email,
      password
    );

    return res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .redirect("/");
  } catch (error) {
    console.log(error);
    return res.render("signin", {
      error: error,
    });
  }
});

router.get("/refresh", async (req, res) => {
  let rtoken = req.cookies.refreshToken;
  let refresh = checkTokenR(rtoken);
  const userdata = await User.findById(refresh._id);

  if (rtoken !== userdata.refreshToken) return "/logout";
  const accessToken = createAccessToken(userdata);
  const refreshToken = createRefreshToken(userdata);

  await User.findByIdAndUpdate(refresh._id, { refreshToken });
  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .redirect("/");
});

router.post("/signup", async (req, res) => {
  let { fullname, email, password } = req.body;
  email = email.toLowerCase();
  fullname = fullname.toLowerCase();

  let is_user =  await User.findOne({fullname: fullname})

  if(is_user !== null ){
    return res.render("signup",{
      error: "Username already exist"
    })
  }
  await User.create({
    fullname,
    email,
    password,
  });
  return res.redirect("/signin");
});

router.get("/logout", async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: "" } },
    { new: true }
  );
  res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .redirect("/");
});

router.get("/profile/forgotpassword", async (req, res) => {

  res.render("forgotPassword");
})

router.post("/profile/forgotpassword", async (req, res) => {
  let { email } = req.body
  email = email.toLowerCase()
  let userDeatil = await User.findOne({email});
  
  if(!userDeatil){
    return res.status(400).render("forgotPassword", {
      user: req.user,
      error: "user not found",
    });
  }
  let userId = userDeatil._id;
  const otp = generateOTP();
  sendOtpMail(email,otp);
  await OTP.create({
    otp,
    userId
  })
  return res.status(400).render("forgotPassword", {
    user: req.user,
    message: "Email sent",
  });
})

router.get("/resetpassword", (req, res) => {
  res.render("resetPassword", {
    message: "check otp",
  });
});

router.post("/resetpassword", async (req, res) => {
  const { otp } = req.body;
  const details = await OTP.findOne({ otp }).populate("userId");
if(!details){
  res.render("resetPassword", {
    message: "check otp",
    error: "otp not match or expired"
  });
}
await OTP.findOneAndDelete({otp})
 res.render("resetPassword", {
    email: details.userId.email,
    message: "add new",
  });
});

router.post("/addnewpassword", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({email});
  user.password = password;
  await user.save();
  const { accessToken, refreshToken } = await User.matchPassword(
    email,
    password
  );

  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .redirect("/");
});

router.post("/comment/:id", async (req,res) =>{
  const { comment } = req.body;
  await Comment.create({comment,
    createdBy: req.user._id,
    blogId: req.params.id
  })
  res.redirect(`/readblog/${req.params.id}`)
});

router.get('/profile/:uname', authHome, async (req,res) =>{
  const blogerName = req.params.uname

  const blogUser = await User.findOne({fullname:blogerName});
  const blog = await Blog.find({createdBy:blogUser._id});
  res.render("bloggerProfile", {
    user: req.user,
    blogWriter: blogUser,
    blogs: blog,
  });
});

module.exports = router;
