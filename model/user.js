const { model, Schema } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { createAccessToken, createRefreshToken } = require("../services/auth");
const { type } = require("os");

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: "images/defult.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    access: {
      type: Boolean,
      default: true
    },
    refreshToken:{
      type: String
    },
    isMember:{
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next){
    const user = await this;

    if(!user.isModified("password")) return;

    const salt = randomBytes(16).toString();
    const hashPassword = createHmac("sha256",salt)
        .update(user.password)
        .digest("hex");
    
    this.salt = salt;
    this.password = hashPassword;

    next();
});

userSchema.static("matchPassword", async function(email, password){
  const user = await this.findOne({email});
  if(!user) throw new Error("Incorrect Username");
  if(!user.access) throw new Error("You Are Unauthorices");
  const salt = user.salt;
  const hashPassword = user.password;
  const newPassword = createHmac("sha256",salt)
  .update(password)
  .digest("hex");

  if(hashPassword !== newPassword) throw new Error("Incorrect password!");
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  

  user.refreshToken = refreshToken;
  await this.findOneAndUpdate({email},{refreshToken:refreshToken})



  

  return { accessToken, refreshToken };

});

userSchema.static("checkPass", async function(email,password) {
  const user = await this.findOne({email});
  const salt = user.salt;
  const hashPassword = user.password;
  const newPassword = createHmac("sha256",salt)
  .update(password)
  .digest("hex");
  let match= true
  if(hashPassword !== newPassword){
    match = false
    return {user, match };
  } 
  return {user, match};

})

const User = model("user", userSchema);

module.exports = User;