import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const TextEditor = () => {

  // Extract document ID from the URL
  const { id: docId } = useParams();

  // State variables for managing the socket and Quill instances
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();

  const SAVE_INTERVAL = 1500;  // Save interval for periodically saving the document

  // Effect to initialize the socket connection
  useEffect(() => {
    // Connect to the Socket.io server
    const socketServer = io("http://localhost:3001");
    setSocket(socketServer);

    // Cleanup function to disconnect the socket when the component unmounts
    return () => {
      socketServer.disconnect();
    };
  }, []);

  // Effect to load the document from the server when the socket and Quill instances are ready
  useEffect(() => {
    if (socket == null || quill == null) return;

    // Load the document content from the server
    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });

    // Request the document content from the server
    socket.emit("get-document", docId);
  }, [socket, quill, docId]);


  // Effect to periodically save the document to the server
  useEffect(() => {
    if (socket == null || quill == null) return;

    // Setup interval for saving the document
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL);

    // Cleanup function to clear the interval when the component unmounts
    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  // Effect to handle incoming changes from other users and update the Quill editor
  useEffect(() => {
    if (socket == null || quill == null) return;

    // Event handler for receiving changes from other users
    const handler = (delta) => {
      quill.updateContents(delta);
    };

    // Set up a socket listener for "receive-changes" and update the Quill contents 
    socket.on("receive-changes", handler);

    // Cleanup function to clean the socket listener when the component unmounts
    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  // Effect to handle local changes and send them to the server
  useEffect(() => {
    if (socket == null || quill == null) return;

    // Event handler for local text changes
    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return; // Ignore non-user changes
      socket.emit("send-changes", delta);
    };

    // Register the event handler with the Quill editor
    quill.on("text-change", handler);

    // Cleanup function to unregister the event handler when the component unmounts
    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);


  // Callback function to set up the Quill editor when the wrapper element is available
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    // Clear the wrapper and create a new Quill editor
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const quillServer = new Quill(editor, {
      theme: "snow"
    });
    quillServer.disable(); // Disable editing until the document is loaded
    quillServer.setText("Loading the document...");
    setQuill(quillServer); //Set the Quill instance in the state
  }, []);

  // Render the Quill editor within a container
  return <div className="container" ref={wrapperRef}></div>;
};

export default TextEditor;
