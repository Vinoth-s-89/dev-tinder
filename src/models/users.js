const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    minLength: [4, "First name must be at least 4 characters"],
    maxLength: [20, "First name must be at most 20 characters"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
  },
  email: {
    type: String,
    required: [true, "Email address is required"],
    unique: [true, "Email address already in use"],
    validate: (value) => {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email address");
      }
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  age: {
    type: Number,
  },
  location: {
    type: String,
  },
  skills: {
    type: [String],
  },
  about: {
    type: String,
  },
  profileUrl: {
    type: String,
  },
});

userSchema.index(
  { firstName: 1, lastName: 1 },
  { unique: [true, "The first name and lastname was already exits"] }
);

module.exports = mongoose.model("User", userSchema, "users");
