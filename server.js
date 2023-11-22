const express = require("express");
const app = express();

const Text = require("./backend/textModel");

const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/AutosaveDoc").then((data) => {
  console.log(`Mongodb connected with server: ${data.connection.host}`);
});

app.use(express.json());

const io = require("socket.io")(3001, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  })

const defaultValue = "";

io.on("connection", socket => {
    socket.on("get-document", async docId => {
      const document = await findOrCreateDoc(docId)
      socket.join(docId)
      socket.emit("load-document", document.textData)
  
      socket.on("send-changes", delta => {
        socket.broadcast.to(docId).emit("receive-changes", delta)
      })
  
      socket.on("save-document", async textData => {
        await Text.findByIdAndUpdate(docId, { textData })
      })
    })
  })

async function findOrCreateDoc(id) {
  if (id == null) return;

  const document = await Text.findById(id);
  if (document) return document;
  return await Text.create({ _id: id, textData: defaultValue });
}

const PORT = 8000;

const server = app.listen(PORT, () => {
  console.log("Server is working on: " + PORT);
});
