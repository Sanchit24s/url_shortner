const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user.id, email: req.user.email, name: req.user.name },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Authentication successful",
            token,
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
            },
        });
    }
);

router.get("/profile", authMiddleware, (req, res) => {
    res.json({ success: true, message: `Welcome ${req.user.name}` });
});

router.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
});

module.exports = router;
