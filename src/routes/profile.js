const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/authMiddlewares");

router.get("/profile/view", userAuth, async (req, res) => {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;
