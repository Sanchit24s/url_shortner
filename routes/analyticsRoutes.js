const express = require("express");
const { getAlias, getTopicBasedAnalytics, overallAnalytics } = require("../controllers/analyticsController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/overall", authMiddleware, overallAnalytics);
router.get("/:alias", getAlias);
router.get("/topic/:topic", getTopicBasedAnalytics);

module.exports = router;