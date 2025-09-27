const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: String,
    enum: {
      values: ["ignored", "interested", "accepted", "rejected"],
      message: "{VALUE} is invalid status",
    },
    required: true,
  },
});

schema.index({ fromUserId: 1, toUserId: 1 });

schema.pre("save", function (next) {
  const { fromUserId, toUserId } = this;

  if (fromUserId.equals(toUserId)) {
    throw new Error("Can't send request to yourself");
  }
  next();
});

module.exports = mongoose.model(
  "connectionRequests",
  schema,
  "connection_requests"
);
