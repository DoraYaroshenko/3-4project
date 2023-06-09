const jwt = require("jsonwebtoken");
const { config } = require("../config/secret");

exports.auth = (req,res,next) => {
    let token = req.header("x-api-key");
    if(!token){
        return res.status(401).json({err:"You must send token to this endpoint"});
    }
    try{
        let decodeToken = jwt.verify(token, config.tokenSecret);

        req.tokenData = decodeToken;

        next();
    }
    catch(err){
        console.log(err);
        res.status(401).json({err:"The token you sent is invalid or expired"})
    }
}