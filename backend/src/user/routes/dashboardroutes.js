const express = require("express");
const { getDashboardData } = require("../controllers/dashboardcontroller");

const router = express.Router();

router.get("/", getDashboardData);

module.exports = router;
