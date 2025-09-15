const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/users");
const { signUpValidator, validateLogin } = require("./validators/validate");
const bctypt = require("bcrypt");

const app = express();

connectDB().then(() => {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});

app.use(express.json());

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
    const isPasswordMatch = await bctypt.compare(
      loginData.password,
      user.password
    );
    if (!isPasswordMatch) {
      throw new Error("Invalid login credentials");
    }
    res.status(200).send({ message: "Login successfully" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

app.post("/user", async (req, res) => {
  try {
    const newUser = new User();
    const response = await newUser.save();
    res
      .status(201)
      .send({ message: "User created successfully", userId: response._id }); //201 Created
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select({ password: 0, __v: 0 });
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: error.message }); //500 Internal Server Error
  }
});

app.post("/getUserData", async (req, res) => {
  try {
    const filter = req.body || {};
    const user = await User.findOne(filter).select({ password: 0, __v: 0 });
    if (user) {
      res.status(200).send(user);
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

app.delete("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const data = await User.findByIdAndDelete(userId);
    if (data) {
      res.status(200).send({ message: "User deleted successfully", data });
    } else {
      throw new Error("Invalid user id");
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

app.put("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    const data = await User.findByIdAndUpdate(userId, updateData, {
      returnDocument: "after",
    });
    if (data) {
      res.status(200).send({ message: "User updated successfully", data });
    } else {
      throw new Error("Invalid user id");
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});
