const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");

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

const routes = [
  require("./routes/auth"),
  require("./routes/profile"),
  require("./routes/requests"),
  require("./routes/user"),
];

app.use(routes);
