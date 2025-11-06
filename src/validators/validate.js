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

const validateProfileEdit = (editData) => {
  const allowedEdits = [
    "firstName",
    "lastName",
    "age",
    "location",
    "skills",
    "about",
    "profileUrl",
    "gender",
  ];
  const notAllowedField = Object.keys(editData).find(
    (key) => !allowedEdits.includes(key)
  );
  if (notAllowedField) {
    throw new Error(`${notAllowedField} is not allowed to edit`);
  }
};

const validatePushSubscription = (subscription) => {
  if (
    !subscription ||
    !subscription?.endpoint?.trim() ||
    !subscription.keys ||
    !subscription.keys?.p256dh?.trim() ||
    !subscription.keys?.auth?.trim()
  ) {
    throw new Error("Invalid push subscription object");
  }
};

module.exports = {
  signUpValidator,
  validateLogin,
  validateProfileEdit,
  validatePushSubscription,
};
