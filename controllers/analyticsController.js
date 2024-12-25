const aggregatedAnalyticsModel = require("../models/aggregatedAnalyticsModel");
const urlModel = require("../models/urlModel");

const getAlias = async (req, res) => {
    try {
        const alias = req.params.alias;

        const analytics = await aggregatedAnalyticsModel.findOne({ alias });

        if (!analytics) {
            return res.status(400).json({
                success: false,
                message: "Analytics not found for the provided alias.",
            });
        }

        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 7);
        const recentDateString = recentDate.toISOString().split("T")[0];

        const recentClicksByDate = analytics.clicksByDate.filter((entry) => {
            return entry.date >= recentDateString;
        });

        // Format the response
        const response = {
            totalClicks: analytics.totalClicks || 0,
            uniqueClicks: analytics.uniqueClicks || 0,
            clicksByDate: recentClicksByDate.map((entry) => ({
                date: entry.date,
                count: entry.count,
            })),
            osType: analytics.osType.map((entry) => ({
                osName: entry.osName,
                uniqueClicks: entry.uniqueClicks || 0,
                uniqueUsers: entry.uniqueUsers || 0,
            })),
            deviceType: analytics.deviceType.map((entry) => ({
                deviceName: entry.deviceName,
                uniqueClicks: entry.uniqueClicks || 0,
                uniqueUsers: entry.uniqueUsers || 0,
            })),
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error("Error retrieving analytics:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const getTopicBasedAnalytics = async (req, res) => {
    try {
        const topic = req.params.topic;

        // Fetch all URLs under the specified topic
        const urls = await urlModel.find({ topic });
        if (urls.length === 0) {
            return res
                .status(404)
                .json({ message: "No URLs found under this topic." });
        }

        let totalClicks = 0;
        let uniqueClicks = 0;
        const clicksByDateMap = new Map();
        const urlAnalytics = [];

        for (const url of urls) {
            const alias = url.shortUrl;

            // Fetch analytics for each URL
            const analytics = await aggregatedAnalyticsModel.findOne({ alias });
            if (analytics) {
                totalClicks += analytics.totalClicks;

                // Update uniqueClicks for the topic (aggregate unique visitors per URL)
                uniqueClicks += analytics.uniqueClicks;

                // Aggregate clicks by date
                for (const dateEntry of analytics.clicksByDate) {
                    if (!clicksByDateMap.has(dateEntry.date)) {
                        clicksByDateMap.set(dateEntry.date, 0);
                    }
                    clicksByDateMap.set(
                        dateEntry.date,
                        clicksByDateMap.get(dateEntry.date) + dateEntry.count
                    );
                }

                // Add URL-specific analytics to the response
                urlAnalytics.push({
                    shortUrl: alias,
                    totalClicks: analytics.totalClicks,
                    uniqueClicks: analytics.uniqueClicks,
                });
            }
        }

        // Convert clicksByDateMap to an array and sort by date
        const clicksByDate = Array.from(clicksByDateMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return res.status(200).json({
            totalClicks,
            uniqueClicks,
            clicksByDate,
            urls: urlAnalytics,
        });
    } catch (error) {
        console.error("Error fetching topic-based analytics:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const overallAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all URLs created by the authenticated user
        const userUrls = await urlModel.find({ userId });
        if (userUrls.length === 0) {
            return res.status(404).json({ message: "No URLs found for the user." });
        }

        let totalClicks = 0;
        let uniqueClicks = 0;
        let totalUrls = userUrls.length;

        const clicksByDateMap = new Map();
        const osTypeMap = new Map();
        const deviceTypeMap = new Map();

        for (const url of userUrls) {
            const alias = url.shortUrl;

            // Fetch analytics for each URL
            const analytics = await aggregatedAnalyticsModel.findOne({ alias });
            if (analytics) {
                totalClicks += analytics.totalClicks;
                uniqueClicks += analytics.uniqueClicks;

                // Aggregate clicks by date
                for (const dateEntry of analytics.clicksByDate) {
                    if (!clicksByDateMap.has(dateEntry.date)) {
                        clicksByDateMap.set(dateEntry.date, 0);
                    }
                    clicksByDateMap.set(
                        dateEntry.date,
                        clicksByDateMap.get(dateEntry.date) + dateEntry.count
                    );
                }

                // Aggregate OS types
                for (const osEntry of analytics.osType) {
                    if (!osTypeMap.has(osEntry.osName)) {
                        osTypeMap.set(osEntry.osName, { uniqueClicks: 0, uniqueUsers: 0 });
                    }
                    const osData = osTypeMap.get(osEntry.osName);
                    osData.uniqueClicks += osEntry.uniqueClicks;
                    osData.uniqueUsers += osEntry.uniqueUsers;
                }

                // Aggregate device types
                for (const deviceEntry of analytics.deviceType) {
                    if (!deviceTypeMap.has(deviceEntry.deviceName)) {
                        deviceTypeMap.set(deviceEntry.deviceName, {
                            uniqueClicks: 0,
                            uniqueUsers: 0,
                        });
                    }
                    const deviceData = deviceTypeMap.get(deviceEntry.deviceName);
                    deviceData.uniqueClicks += deviceEntry.uniqueClicks;
                    deviceData.uniqueUsers += deviceEntry.uniqueUsers;
                }
            }
        }

        // Convert maps to arrays
        const clicksByDate = Array.from(clicksByDateMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const osType = Array.from(osTypeMap.entries()).map(([osName, data]) => ({
            osName,
            uniqueClicks: data.uniqueClicks,
            uniqueUsers: data.uniqueUsers,
        }));

        const deviceType = Array.from(deviceTypeMap.entries()).map(
            ([deviceName, data]) => ({
                deviceName,
                uniqueClicks: data.uniqueClicks,
                uniqueUsers: data.uniqueUsers,
            })
        );

        // Return aggregated analytics
        return res.status(200).json({
            totalUrls,
            totalClicks,
            uniqueClicks,
            clicksByDate,
            osType,
            deviceType,
        });
    } catch (error) {
        console.error("Error fetching overall analytics:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

module.exports = { getAlias, getTopicBasedAnalytics, overallAnalytics };
