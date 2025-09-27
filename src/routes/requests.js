const express = require("express");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/users");
const router = express.Router();
const { userAuth } = require("../middlewares/authMiddlewares");

router.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { toUserId, status } = req.params;
    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status)) {
      throw new Error(`${status} is not allowed`);
    }
    const user = await User.findById(toUserId);
    if (!user) {
      throw new Error("User not found");
    }
    const hasDuplicate = await ConnectionRequest.findOne({
      $or: [
        {
          fromUserId,
          toUserId,
        },
        {
          fromUserId: toUserId,
          toUserId: fromUserId,
        },
      ],
    });

    if (hasDuplicate) throw new Error("Duplicate entry");
    await new ConnectionRequest({ fromUserId, toUserId, status }).save();
    return res.status(200).send({ message: `${status} successfully` });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

router.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { requestId, status } = req.params;

      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid Status" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest)
        return res.status(400).json({ message: "Request not found" });

      connectionRequest.status = status;

      await connectionRequest.save();

      return res.status(200).json({ message: "Request was " + status });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
