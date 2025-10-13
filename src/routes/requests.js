const express = require("express");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/users");
const router = express.Router();
const { userAuth } = require("../middlewares/authMiddlewares");
const { sendEmail } = require("../utils/sendEmail");

router.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const loggedInUser = req.user;
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
    const connectionRequest = await new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });
    await connectionRequest.save();
    await sendEmail(
      "vinothpuvi872001@gmail.com",
      "devtinder@vinothcodes.in",
      `${loggedInUser.firstName} was interested in ${user.firstName}`,
      "Interest requets arrived for you"
    );

    if (status === "interested")
      return res.status(200).send({
        message: `${loggedInUser.firstName} ${loggedInUser.lastName} intested in ${user.firstName} ${user.lastName}`,
        data: connectionRequest,
      });
    return res.status(200).send({
      message: `${loggedInUser.firstName} ${loggedInUser.lastName} ignored ${user.firstName} ${user.lastName}'s profile`,
      data: connectionRequest,
    });
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

      return res
        .status(200)
        .json({ message: "Request was " + status, data: connectionRequest });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
