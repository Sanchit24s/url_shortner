const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const connectDB = require("./config/connectDB");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
require("./config/passport");

const app = express();
connectDB();

app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("<a href='/auth/google'>Login with Google</a>");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});