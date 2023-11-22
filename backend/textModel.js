const mongoose = require("mongoose");

const textSchema = new mongoose.Schema({
    _id: String,
    textData: Object,
});

module.exports = mongoose.model("Text", textSchema);