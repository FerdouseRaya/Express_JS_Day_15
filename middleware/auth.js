const jsonwebtoken = require('jsonwebtoken');
const { success, failure } = require('../util/common');

const isAuthorized = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(400).send(failure("Not authorized"));
    }

      const jwtToken = req.headers.authorization.split(" ")[1];
      const validation = jsonwebtoken.verify(jwtToken, process.env.SECRET_KEY);

      if (validation) {
        next();
      } else {
        throw new Error();
      }
  } catch (error) {
    console.log(error);
    if (error instanceof jsonwebtoken.JsonWebTokenError) {
      return res.status(400).send(failure('Token invalid'));
    }


    if (error instanceof jsonwebtoken.TokenExpiredError) {
      return res.status(400).send(failure("Token expired"));
    }


    return res.status(400).send(failure("Authentication error"));
  }
};

const isAdmin=(req,res,next)=>{
    try{
        const jwtToken = req.headers.authorization.split(" ")[1];
        const decodedToken = jsonwebtoken.decode(jwtToken);
        if(!decodedToken){
            throw new Error();
        }
        if(decodedToken.role ===1){
            console.log("Hello");
            res.status(200).send(success("Hello Admin!"));
            next();
        }
        else{
            res.status(400).send(failure("User is not an Admin. Permission Denied!!!"))
        }
    }catch(error){
        res.status(400).send(failure("Autentication Error"))
    }
}

module.exports = { isAuthorized, isAdmin };