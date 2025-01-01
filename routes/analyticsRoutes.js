const express = require("express");
const { getAlias, getTopicBasedAnalytics, overallAnalytics } = require("../controllers/analyticsController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/overall", authMiddleware, overallAnalytics);
router.get("/:alias", authMiddleware, getAlias);
router.get("/topic/:topic", authMiddleware, getTopicBasedAnalytics);

module.exports = router;