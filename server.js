const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());


app.get("/", (req, res) => {
    res.json({ message: "Hello" });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});