const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { registerValidation, loginValidation } = require("../middleware/validation");

// POST /user/register
router.post("/register", registerValidation, userController.register);

// POST /user/login
router.post("/login", loginValidation, userController.login);

// GET /user/logout
router.get("/logout", userController.logout);

module.exports = router;


