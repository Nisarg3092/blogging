const { errors } = require("formidable");
const { checkToken } = require("../services/auth");

function checkCookies(cookieName) {
  return (req, res, next) => {
    const cookieValue = req.cookies[cookieName];
    if (!cookieValue) {
        return next();
    }
    try {
      const userPayload = checkToken(cookieValue);
      req.user = userPayload
    } catch (error) {}
    return next();
  };
}

function authUser( req, res, next){
  if(req.cookies.refreshToken){
    let token = req.cookies.accessToken
    if(!token) return res.redirect('/refresh');
    let payload = checkToken(req.cookies.accessToken);
    if(payload === false) return res.redirect('/refresh');
  }
  let user = req.user;
  if(!user) return res.redirect('/');
  next()
}

function authHome( req, res, next){
  if(req.cookies.refreshToken){
    let token = req.cookies.accessToken
    if(!token) return res.redirect('/refresh');
    let payload = checkToken(req.cookies.accessToken);
    if(payload === false) return res.redirect('/refresh');
  }
  let user = req.user;
  if(!user) req.user =  null;
  next()
}

function authAdmin( req, res, next){
  if(req.cookies.refreshToken){
    let token = req.cookies.accessToken
    if(!token) return res.redirect('/refresh');
    let payload = checkToken(req.cookies.accessToken);
    if(payload === false) return res.redirect('/refresh');
  }
  let user = req.user;
  if(!user) return res.redirect('/');
  if(user.role !== "ADMIN") return res.redirect('/');
  next()
}


module.exports = { checkCookies, authUser, authAdmin, authHome }