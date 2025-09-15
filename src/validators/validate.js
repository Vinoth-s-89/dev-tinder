const validator = require("validator");

const signUpValidator = (userData) => {
  let { firstName = "", lastName = "", email = "", password = "" } = userData;
  firstName = firstName.trim();
  lastName = lastName.trim();
  email = email.trim();
  password = password.trim();
  if (!firstName || !lastName || !email || !password) {
    throw new Error("All fields are required");
  }
  if (firstName.length < 4 || firstName.length > 20) {
    throw new Error("First name must be between 4 and 20 characters");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email address");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Enter strong password");
  }
};

const validateLogin = (loginData) => {
  let { email = "", password = "" } = loginData;
  email = email.trim();
  password = password.trim();
  if (!email || !password) {
    throw new Error("All fields are required");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email address");
  }
};

module.exports = { signUpValidator, validateLogin };
