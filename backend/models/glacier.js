const mongoose = require("mongoose");

const glacierSchema = new mongoose.Schema({
  country: String,
  short_name: String,
  names: String,
  id: Number,
  latitude: Number,
  longitude: Number,
  gtng_region: String,
  glims_id: String,
  rgi50_ids: String,
  rgi60_ids: String,
  rgi70_ids: String,
  wgi_id: String,
  parent_glacier_id: String,
  references: String,
  remarks: String,
});

module.exports = mongoose.model("Glacier", glacierSchema);
