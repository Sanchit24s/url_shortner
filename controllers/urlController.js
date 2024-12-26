const { nanoid } = require("nanoid");
const validator = require("validator");
const urlModel = require("../models/urlModel");
const axios = require("axios");
const redisClient = require("../config/redis");
const redirectEventModel = require("../models/redirectEventModel");
const aggregatedAnalyticsModel = require("../models/aggregatedAnalyticsModel");

const shortenUrl = async (req, res) => {
    try {
        let { longUrl, customAlias, topic } = req.body;
        if (!longUrl || !validator.isURL(longUrl)) {
            return res.status(400).json({ message: "Invalid or missing URL." });
        }
        const userId = req.user.id;

        if (!customAlias) {
            customAlias = nanoid(10);
        }

        let shortUrl = `${process.env.SERVER_URL}/api/shorten/${customAlias}`;
        const existing = await urlModel.findOne({ shortUrl });

        if (existing)
            return res.status(400).json({ error: "Custom alias already exists" });

        const newUrl = new urlModel({ longUrl, shortUrl, topic, userId, customAlias });
        await newUrl.save();
        await redisClient.set(`shortUrl:${shortUrl}`, longUrl);

        res.status(201).json({ shortUrl, createdAt: newUrl.createdAt });
    } catch (error) {
        console.error("Shorten URL Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const redirectShortUrl = async (req, res) => {
    try {
        const alias = req.params.alias;

        // Check Redis cache first
        let longUrl = await redisClient.get(`shortUrl:${alias}`);
        if (!longUrl) {
            const urlEntry = await urlModel.findOne({ customAlias: alias });
            if (!urlEntry) {
                return res.status(404).json({ message: "Short URL not found." });
            }
            longUrl = urlEntry.longUrl;

            // Cache the long URL in Redis
            await redisClient.set(`shortUrl:${alias}`, longUrl);
        }

        // Capture analytics data
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated." });
        }

        const userAgent = req.headers["user-agent"];
        console.log(userAgent);
        const timestamp = new Date();
        const dateString = timestamp.toISOString().split("T")[0];

        // Extract device and OS information 
        const userAgentParser = require("ua-parser-js");
        const parsedUserAgent = userAgentParser(userAgent);
        const osName = parsedUserAgent.os.name || "Unknown OS";
        const deviceName = parsedUserAgent.device.model || "Unknown device";

        // Fetch or create aggregated analytics
        let analytics = await aggregatedAnalyticsModel.findOne({ alias });
        if (!analytics) {
            analytics = new aggregatedAnalyticsModel({
                alias,
                totalClicks: 0,
                uniqueClicks: 0,
            });
        }

        analytics.totalClicks += 1;

        // Update unique clicks and unique visitors
        if (!analytics.uniqueVisitors) analytics.uniqueVisitors = [];
        if (!analytics.uniqueVisitors.includes(userId)) {
            analytics.uniqueVisitors.push(userId);
            analytics.uniqueClicks += 1;
        }

        // Update clicks by date
        let dateEntry = analytics.clicksByDate.find(
            (entry) => entry.date === dateString
        );
        if (!dateEntry) {
            dateEntry = { date: dateString, count: 1 };
            analytics.clicksByDate.push(dateEntry);
        }
        dateEntry.count += 1;

        // Update OS analytics
        let osEntry = analytics.osType.find((entry) => entry.osName === osName);
        if (!osEntry) {
            osEntry = { osName, uniqueClicks: 0, uniqueUsers: 0 };
            analytics.osType.push(osEntry);
        }
        osEntry.uniqueClicks += 1;
        if (!osEntry.uniqueVisitors) osEntry.uniqueVisitors = [];
        if (!osEntry.uniqueVisitors.includes(userId)) {
            osEntry.uniqueVisitors.push(userId);
            osEntry.uniqueUsers += 1;
        }

        // Update device analytics
        let deviceEntry = analytics.deviceType.find(
            (entry) => entry.deviceName === deviceName
        );
        if (!deviceEntry) {
            deviceEntry = { deviceName, uniqueClicks: 0, uniqueUsers: 0 };
            analytics.deviceType.push(deviceEntry);
        }
        deviceEntry.uniqueClicks += 1;
        if (!deviceEntry.uniqueVisitors) deviceEntry.uniqueVisitors = [];
        if (!deviceEntry.uniqueVisitors.includes(userId)) {
            deviceEntry.uniqueVisitors.push(userId);
            deviceEntry.uniqueUsers += 1;
        }

        // Save analytics updates
        await analytics.save();

        // Capture detailed redirect event analytics 
        let geoData = {};
        try {
            const geoResponse = await axios.get(`http://ip-api.com/json/${req.ip}`, {
                timeout: 5000, // 5 s
            });
            geoData = geoResponse.data;
        } catch (geoError) {
            console.error("Geolocation fetch failed:", geoError.message);
        }

        new redirectEventModel({
            alias,
            timestamp: timestamp.toISOString(),
            userId,
            userAgent,
            location: geoData,
        })
            .save()
            .catch((error) => console.error("Event logging failed:", error));

        // Redirect to the original url
        return res.redirect(longUrl.toString());
    } catch (error) {
        console.error("Redirection error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

module.exports = { shortenUrl, redirectShortUrl };
