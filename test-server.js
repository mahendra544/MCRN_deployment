const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("TEST SERVER WORKING");
});

app.listen(5001, "127.0.0.1", () => {
    console.log("Test server running on http://127.0.0.1:5001");
});
