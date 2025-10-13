const User = require("../models/users");
const jsonwebtoken = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send("Please login !!!");
    }
    const decoded = jsonwebtoken.verify(token, process.env.PASSWORD_SECRET_KEY);
    const user = await User.findById(decoded._id).select({
      password: 0,
      __v: 0,
    });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).send({ message: error.message });
  }
};
module.exports = { userAuth };
