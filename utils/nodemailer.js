const nodemailer = require("nodemailer");
const crypto = require('crypto'); 

transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: "zatch2903@gmail.com",
    pass: "trne dhsa jzpy tavf",
  },
});

function generateOTP() {  
    return crypto.randomInt(1000, 10000).toString() 
  }  

function sendOtpMail(email,otp){
  

    let mailOptions = {
        from: "zatch2903@gmail.com",
        to: email,
        subject: `We've made it easy to get back on website`,
        html: `  
   <p>Sorry to hear you’re having trouble logging into Instagram. We got a message that you forgot your password. If this was you, you can get right back into your account or reset your password now.</p>

<p>Your OTP is: <strong>${otp}</strong></p>
<p><em>Note: This OTP will expire in 2 minutes.</em></p>

<a href="http://localhost:4000/resetpassword">
  <button style="background-color: #4CAF50; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Change Password</button>
</a>
 
  `,
}

 transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
      
        } else {
          console.log("Email sent: " + info.response);
        }
      });
}

module.exports = { sendOtpMail, generateOTP }