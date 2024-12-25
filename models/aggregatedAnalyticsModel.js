const mongoose = require("mongoose");

const aggregatedAnalyticsSchema = new mongoose.Schema({
    alias: { type: String, required: true },
    totalClicks: { type: Number, default: 0 },
    uniqueClicks: { type: Number, default: 0 },
    clicksByDate: [
        {
            date: { type: String },
            count: { type: Number, default: 0 },
        },
    ],
    osType: [
        {
            osName: { type: String },
            uniqueClicks: { type: Number, default: 0 },
            uniqueUsers: { type: Number, default: 0 },
            uniqueVisitors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        },
    ],
    deviceType: [
        {
            deviceName: { type: String },
            uniqueClicks: { type: Number, default: 0 },
            uniqueUsers: { type: Number, default: 0 },
            uniqueVisitors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        },
    ],
    uniqueVisitors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const aggregatedAnalyticsModel = mongoose.model(
    "AggregatedAnalytics",
    aggregatedAnalyticsSchema
);

module.exports = aggregatedAnalyticsModel;
