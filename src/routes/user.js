const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/authMiddlewares");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/users");

const USER_FIELDS = [
  "_id",
  "firstName",
  "lastName",
  "email",
  "profileUrl",
  "age",
  "gender",
  "about",
];

router.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const requests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    })
      .populate("fromUserId", USER_FIELDS)
      .select("_id");

    const data = requests.map(({ _id, fromUserId }) => ({
      _id,
      firstName: fromUserId.firstName,
      lastName: fromUserId.lastName,
      email: fromUserId.email,
      profileUrl: fromUserId.profileUrl,
      age: fromUserId.age,
      gender: fromUserId.gender,
      about: fromUserId.about,
      userId: fromUserId._id,
    }));

    return res.status(200).send(data);
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
      const { fromUserId, toUserId } = con;
      if (fromUserId._id.toString() === loggedInUser._id.toString()) {
        return toUserId;
      }
      return fromUserId;
    });
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

router.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const hiddenRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select(["fromUserId", "toUserId"]);
    const hiddenUsers = new Set();
    hiddenRequests.forEach((connectionReq) => {
      hiddenUsers.add(connectionReq.fromUserId);
      hiddenUsers.add(connectionReq.toUserId);
    });

    const feeds = await User.find({
      $and: [
        { _id: { $nin: Array.from(hiddenUsers) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select("firstName lastName email skills profileUrl about location age")
      .skip(skip)
      .limit(limit);
    return res.status(200).json(feeds);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

module.exports = router;
