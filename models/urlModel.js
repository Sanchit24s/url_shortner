const { Schema, model } = require("mongoose");

const urlSchema = new Schema({
    longUrl: {
        type: String,
        required: true,
    },
    shortUrl: {
        type: String,
        required: true,
    },
    customAlias: {
        type: String,
    },
    topic: {
        type: String,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    clickCount: {
        type: Number,
        default: 0,
    },
});

const urlModel = model("URL", urlSchema);
module.exports = urlModel;
