const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/authMiddlewares");
const { validateProfileEdit } = require("../validators/validate");
const { uploadFile, removeFile } = require("../utils/awss3config");

router.get("/profile/view", userAuth, async (req, res) => {
  try {
    return res.status(200).send(req.user);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

router.patch("/profile/update", userAuth, async (req, res) => {
  try {
    validateProfileEdit(req.body);
    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key];
    });
    if (typeof req.files?.profileUrl === "object") {
      const { location, fileKey } = await uploadFile(
        req.files?.profileUrl,
        loggedInUser.profileImageKey
      );
      loggedInUser.profileUrl = location;
      loggedInUser.profileImageKey = fileKey;
    }
    if (
      typeof req.body?.profileUrl === "string" &&
      !req.body?.profileUrl &&
      loggedInUser.profileImageKey
    ) {
      await removeFile(loggedInUser.profileImageKey);
      loggedInUser.profileImageKey = "";
    }
    await loggedInUser.save();
    return res.status(200).send({
      message: `${loggedInUser.firstName} profile updated successfully`,
      data: loggedInUser,
    });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

module.exports = router;
