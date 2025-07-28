const express = require("express");
const router = express.Router();
const ghsController = require("../controllers/ghsController");

router.get("/ghs", ghsController.getAllGHSData);

module.exports = router;
