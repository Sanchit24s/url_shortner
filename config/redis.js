require("dotenv").config();
const { createClient } = require("redis");

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
    try {
        await redisClient.connect();
        console.log("Connected to Redis successfully");
    } catch (error) {
        console.error("Could not connect to Redis", error);
    }
})();

module.exports = redisClient;
