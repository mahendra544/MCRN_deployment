const express = require("express");
const { getChildren, getChildById, getFilterOptions } = require("../controllers/childrencontroller");

const router = express.Router();

router.get("/filters", getFilterOptions);
router.get("/search", getChildren);
router.get("/:id", getChildById);
router.get("/", getChildren);

module.exports = router;
