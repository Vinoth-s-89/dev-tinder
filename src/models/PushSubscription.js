const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    endpoint: {
      type: String,
      required: true,
    },
    p256dh: {
      type: String,
      required: true,
    },
    auth: {
      type: String,
      required: true,
    },
    expirationTime: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ userId: 1, endpoint: 1 }, { unique: true });

const PushSubscriptionModel = mongoose.model("PushSubscriptionModel", schema);

module.exports = PushSubscriptionModel;
