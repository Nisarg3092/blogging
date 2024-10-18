const jwt = require('jsonwebtoken');
const accessSecret = "poiuqwerlkjhasdfmnbvzxcv";
const refreshSecret = "fgdbnmseknjdbhfvgfdhsjnkam";

function createAccessToken(user){
    const payload = {
        _id: user._id,
        email: user.email,
        profileImgae: user.profileImgae,
        role: user.role,
        access: user.access
    };
    const accessToken = jwt.sign(payload,accessSecret,{expiresIn: '1d'});
    return accessToken;
}

function createRefreshToken(user){
    const refreshToken = jwt.sign({
        _id: user._id},refreshSecret,{expiresIn: '10d'});
        return refreshToken
}

function checkToken(token){
    try {
        const payload = jwt.verify(token,accessSecret);
        return payload;
    } catch (error) {
        if(error.name === "TokenExpiredError")
            return false;
    }
}

function checkTokenR(token){
    const payload = jwt.verify(token,refreshSecret);
    return payload;
}



module.exports = { createAccessToken, checkToken, checkTokenR, createRefreshToken }