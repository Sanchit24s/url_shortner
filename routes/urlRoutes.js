const express = require("express");
const rateLimiter = require("../middlewares/rateLimiter");
const { shortenUrl, redirectShortUrl } = require("../controllers/urlController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, rateLimiter, shortenUrl);
router.get("/:alias", authMiddleware, redirectShortUrl);

module.exports = router;