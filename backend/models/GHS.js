const mongoose = require("mongoose");

const ghsSchema = new mongoose.Schema({
  year: Number,
  co2: Number,
  ch4: Number,
  n2o: Number,
  punjab_co2: Number,
  punjab_ch4: Number,
  punjab_n2o: Number,
  sindh_co2: Number,
  sindh_ch4: Number,
  sindh_n2o: Number,
  kpk_co2: Number,
  kpk_ch4: Number,
  kpk_n2o: Number,
  balochistan_co2: Number,
  balochistan_ch4: Number,
  balochistan_n2o: Number,
});

module.exports = mongoose.model("GHS", ghsSchema);
