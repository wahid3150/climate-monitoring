const express = require("express");
const router = express.Router();
const glacierController = require("../controllers/glacierController");

router.get("/glaciers", glacierController.getAllGlaciers);

module.exports = router;
