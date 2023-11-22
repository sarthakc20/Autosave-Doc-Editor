const mongoose = require("mongoose");

// Define a Mongoose schema for the "Text" collection
const textSchema = new mongoose.Schema({
    _id: String,
    textData: Object,
});

// Create a Mongoose model for the "Text" collection using the defined schema
module.exports = mongoose.model("Text", textSchema);