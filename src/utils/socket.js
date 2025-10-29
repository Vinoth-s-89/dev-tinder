const { Server } = require("socket.io");
const crypto = require("crypto");

function getRoomId(userId, targetUserId) {
  const roomId = [userId, targetUserId].sort().join("_");
  return crypto.createHash("sha256").update(roomId).digest("hex");
}

function initializeSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:4000",
    },
  });
  //   You are attaching Socket.IO to your existing HTTP server.
  io.on("connection", (socket) => {
    console.log("New socket connection was made :", socket.id);

    // Joining chat rooms
    socket.on("joinChat", ({ targetUserId, userId }) => {
      const roomId = getRoomId(userId, targetUserId);
      socket.join(roomId);
      console.log(`User with ID: ${userId} joined room: ${roomId}`);
    });

    socket.on("sendMessage", ({ targetUserId, userId, newMessage }) => {
      const roomId = getRoomId(userId, targetUserId);
      io.to(roomId).emit("messageReceived", {
        fromId: userId,
        toId: targetUserId,
        message: newMessage,
      });
      console.log(
        `Message from User ${userId} to User ${targetUserId} in room ${roomId}: ${newMessage}`
      );
    });
  });

  // Once a client successfully connects, Socket.IO emits a "connection" event on the server side.
  // Each connection gets a unique socket object that represents that user’s persistent connection.
}

module.exports = initializeSocketServer;

// The Connection Flow (under the hood):

// Browser → HTTP handshake:
// Client (e.g., Socket.IO client in browser) first sends an HTTP GET request to:

// GET /socket.io/?EIO=4&transport=polling&t=...

// Server responds:
// The Server(httpServer) instance intercepts requests to /socket.io/ and replies with info like:

// {
//   "sid": "xyz123",
//   "upgrades": ["websocket"],
//   "pingInterval": 25000,
//   "pingTimeout": 5000
// }

// Protocol upgrade:
// Then, the client sends another request:

// GET /socket.io/?EIO=4&transport=websocket

// → The server upgrades that HTTP connection to a WebSocket connection.

// Bi-directional channel established:
// Now client and server can send messages freely without re-opening HTTP requests each time.

// Once a client successfully connects, Socket.IO emits a "connection" event on the server side.

// io.on("connection", (socket) => {
//   console.log("Client connected:", socket.id);
// });

// Each connection gets a unique socket object that represents that user’s persistent connection.

// You can then:

// Listen for custom events: socket.on('chatMessage', ...)

// Send messages: socket.emit('welcome', 'Hello!')

// Broadcast to all users: io.emit('userJoined', data)

// Now we can listen and emit events in real-time over this persistent WebSocket connection!

// Using socket.on("joinChat", () => {}) and socket.emit("newMessage", data)
