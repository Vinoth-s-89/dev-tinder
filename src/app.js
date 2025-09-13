const express = require("express");

const app = express();

const connectDB = require("./config/database");

connectDB().then(() => {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("App was started successfully");
});

const User = require("./models/users");

const validateMiddleware = (req, res, next) => {
  const skills = req.body.skills;
  if (!Array.isArray(skills) || skills.length === 0) {
    res.status(400).send({ message: "Skills must be a non-empty array" });
  } else if (skills.length > new Set(skills).size) {
    res.status(400).send({ message: "Skills must not contain duplicates" });
  } else {
    next();
  }
};

app.post("/user", validateMiddleware, async (req, res) => {
  try {
    const newUser = new User(req.body);
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
