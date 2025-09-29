const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/authMiddlewares");
const ConnectionRequest = require("../models/connectionRequest");

const USER_FIELDS = ["_id", "firstName", "lastName", "email", "profileUrl"];

router.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const requests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    })
      .populate("fromUserId", USER_FIELDS)
      .select("-__v");

    return res.status(200).send(requests);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

router.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_FIELDS)
      .populate("toUserId", USER_FIELDS);
    const data = connections.map((con) => {
      if (con.fromUserId.toString() === loggedInUser._id.toString()) {
        return con.toUserId;
      }
      return con.fromUserId;
    });
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

module.exports = router;
