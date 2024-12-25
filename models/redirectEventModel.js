const mongoose = require("mongoose");

const redirectEventSchema = new mongoose.Schema({
    alias: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String },
    location: { type: Object },
});

const redirectEventModel = mongoose.model("RedirectEvent", redirectEventSchema);
module.exports = redirectEventModel;
