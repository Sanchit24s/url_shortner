const { Schema, model } = require("mongoose");

const userSchema = new Schema(
    {
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        name: {
            type: String,
            required: true,
        },
        profilePicture: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const userModel = model("User", userSchema);
module.exports = userModel;
