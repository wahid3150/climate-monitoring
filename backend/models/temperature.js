const mongoose = require("mongoose");

const temperatureSchema = new mongoose.Schema({
  year: String,
  punjab: Number,
  sindh: Number,
  kpk: Number,
  balochistan: Number,
});

module.exports = mongoose.model("Temperature", temperatureSchema);
