const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://localhost:4000",
    credentials: true,
  })
);

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
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
