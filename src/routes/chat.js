const express = require("express");
const { userAuth } = require("../middlewares/authMiddlewares");
const { Message, Conversation } = require("../models/chat");
const users = require("../models/users");

const userFields = ["_id", "firstName", "lastName", "email", "profileUrl"];

const router = express.Router();

router.get("/chats/:targetUserId", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetUserId } = req.params;
    let conversation = await Conversation.findOne({
      participants: {
        $all: [userId, targetUserId],
      },
    });
    const userDetail = await users.findById(targetUserId).select(userFields);
    if (!conversation) {
      conversation = await new Conversation({
        participants: [userId, targetUserId],
      }).save();
      return res.status(200).json({ messages: [], userDetail });
    }
    const messages = await Message.find({
      conversationId: conversation._id,
    }).populate("senderId", userFields);
    return res.status(200).json({ messages, userDetail });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
