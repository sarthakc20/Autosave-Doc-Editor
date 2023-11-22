const express = require("express");
const app = express();

const Text = require("./backend/textModel");

const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/AutosaveDoc").then((data) => {
  console.log(`Mongodb connected with server: ${data.connection.host}`);
});

// Setup Socket.io with CORS configuration
const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const defaultValue = "";

// Socket.io connection event
io.on("connection", (socket) => {
  // Event when a document is requested
  socket.on("get-document", async (docId) => {
    // Find or create document based on the document id
    const document = await findOrCreateDoc(docId);
    socket.join(docId); // Join the socket room corresponding to the document
    socket.emit("load-document", document.textData); // Emit the document data to the client

    // Event when changes are received from a client
    socket.on("send-changes", (delta) => {
      socket.broadcast.to(docId).emit("receive-changes", delta); // Broadcast changes to other clients in the same room
    });

    // Event when a client wants to save the document
    socket.on("save-document", async (textData) => {
      await Text.findByIdAndUpdate(docId, { textData }); // Update the document in the database
    });
  });
});

// Function to find or create a document in the database
async function findOrCreateDoc(id) {
  if (id == null) return;

  const document = await Text.findById(id);
  if (document) return document;
  return await Text.create({ _id: id, textData: defaultValue });
}

// Start the server on port 8000
const PORT = 8000;

const server = app.listen(PORT, () => {
  console.log("Server is working on: " + PORT);
});
