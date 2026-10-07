const express = require("express");

const router = express.Router();

const {
    getAllPolice,
    getPoliceById,
    addPolice,
    updatePolice,
    updatePoliceStatus,
    deletePolice,
    policeLogin
} = require("../controllers/policeController");
// POLICE LOGIN
router.post("/login", policeLogin);

// GET all police
router.get("/", getAllPolice);

// GET one police officer
router.get("/:id", getPoliceById);

// ADD police officer
router.post("/", addPolice);

// UPDATE police officer
router.put("/:id", updatePolice);

// UPDATE status
router.patch("/:id/status", updatePoliceStatus);

// DELETE police officer
router.delete("/:id", deletePolice);


module.exports = router;
