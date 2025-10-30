const dotenv = require("dotenv");
dotenv.config();
const { createServer } = require("http");
const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// const jobs = require("./utils/scheduleJobs");

const app = express();

const httpServer = createServer(app);

// createServer() comes from Node’s built-in http module.
// It creates a real HTTP server that can listen to incoming TCP connections (e.g., from browsers, Postman, etc.).

const initializeSocketServer = require("./utils/socket");
initializeSocketServer(httpServer);

app.use(
  cors({
    origin: "http://localhost:4000",
    credentials: true,
  })
);

connectDB().then(() => {
  httpServer.listen(process.env.PORT, () => {
    console.log("Server is running on port 3000");
  });
  //   You’re telling Node:
  // “Open a network socket on port 3000 and start listening for incoming HTTP requests.”
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
  require("./routes/chat"),
];

app.use(routes);
