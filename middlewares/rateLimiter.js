const redisClient = require("../config/redis");

const rateLimiter = async (req, res, next) => {
    const userId = req.user.id;
    const rateLimitKey = `rateLimit:${userId}`;

    try {
        const requestCount = await redisClient.incr(rateLimitKey);
        if (requestCount === 1) {
            await redisClient.expire(rateLimitKey, 3600);
        }

        if (requestCount > 10) {
            return res.status(429).json({ error: "Rate limit exceeded" });
        }

        next();
    } catch (error) {
        console.log("Rate limiting error: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = rateLimiter;
