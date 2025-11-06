const express = require("express");
const {
  signUpValidator,
  validateLogin,
  validatePushSubscription,
} = require("../validators/validate");
const bctypt = require("bcrypt");
const User = require("../models/users");
const { userAuth } = require("../middlewares/authMiddlewares");
const PushSubscriptionModel = require("../models/PushSubscription");

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
    return res
      .status(201)
      .send({ message: "Successfully signed up", userId: response._id }); //201 Created
  } catch (error) {
    return res.status(400).send({ message: error.message });
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
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return res
      .status(200)
      .send({ message: "Logged in successfully", data: user });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const endpoint = req.cookies.endpoint;
    if (endpoint)
      await PushSubscriptionModel.deleteOne({
        endpoint,
      });
    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.cookie("endpoint", null, { expires: new Date(Date.now()) });
    return res.status(200).send({ message: "Logout successfully" });
  } catch (error) {
    console.log(error);
  }
});

router.patch("/changePassword", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    loggedInUser.password = await bctypt.hash(req.body.password, 10);
    await loggedInUser.save();
    return res.send({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

router.post("/subscribe", userAuth, async (req, res) => {
  try {
    validatePushSubscription(req.body);
    const userId = req.user._id;
    const subscription = req.body;
    const hasSubcription = await PushSubscriptionModel.findOne({
      userId,
      endpoint: subscription.endpoint,
    });
    if (hasSubcription) {
      return res.status(200).json({ message: "Already Subscribed" });
    }
    const newSubscription = new PushSubscriptionModel({
      userId,
      expirationTime: subscription.expirationTime,
      endpoint: subscription.endpoint,
      auth: subscription?.keys?.auth,
      p256dh: subscription?.keys?.p256dh,
    });
    await newSubscription.save();
    res.cookie("endpoint", subscription.endpoint, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return res.status(200).json({ message: "Subcribed successfully !!!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
