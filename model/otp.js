const { Schema, model } = require("mongoose");

const otpSchema = new Schema({
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

const OTP = model("otp", otpSchema);

module.exports = OTP;
