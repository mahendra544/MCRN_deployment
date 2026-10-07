const express = require("express");

const router = express.Router();

const {
  getUsers,
  getUserById,
  addUser,
  updateUserStatus,
} = require("../controllers/userController");


// GET all users
router.get("/", getUsers);

// GET single user
router.get("/:id", getUserById);

// ADD new user
router.post("/", addUser);

// UPDATE user status
router.put("/:id/status", updateUserStatus);


module.exports = router;