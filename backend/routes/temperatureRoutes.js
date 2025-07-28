const express = require("express");
const router = express.Router();
const temperatureController = require("../controllers/temperatureController");

router.get("/temperature", temperatureController.getAllTemperatureData);

module.exports = router;
