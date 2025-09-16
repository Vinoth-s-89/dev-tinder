const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/users");
const { signUpValidator, validateLogin } = require("./validators/validate");
const bctypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middlewares/authMiddlewares");

const app = express();

connectDB().then(() => {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});

app.use(express.json());

app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).send("App was started successfully");
});

app.post("/signup", async (req, res) => {
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

app.post("/login", async (req, res) => {
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

app.get("/profile", userAuth, async (req, res) => {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

app.get("/feed", userAuth, async (req, res) => {
  try {
    const users = await User.find().select({ password: 0, __v: 0 });
    res.status(200).send(users);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});
