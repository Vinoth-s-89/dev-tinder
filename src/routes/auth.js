const express = require("express");
const { signUpValidator, validateLogin } = require("../validators/validate");
const bctypt = require("bcrypt");
const User = require("../models/users");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const userData = req.body;
    signUpValidator(userData);
    userData.password = await bctypt.hash(userData.password, 10);
    const newUser = new User({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
    });
    const response = await newUser.save();
    res
      .status(201)
      .send({ message: "Successfully signed up", userId: response._id }); //201 Created
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const loginData = req.body;
    validateLogin(loginData);
    const user = await User.findOne({ email: loginData.email });
    if (!user) {
      throw new Error("Invalid login credentials");
    }
    const isPasswordMatch = await user.hasPasswordMatch(loginData.password);
    if (!isPasswordMatch) {
      throw new Error("Invalid login credentials");
    }
    const token = user.getJWTToken();
    res.cookie("token", token);
    res.status(200).send({ message: "Login successfully" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post("/logout", (req, res) => {
  try {
    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.status(200).send({ message: "Logout successfully" });
  } catch (error) {}
});

module.exports = router;
