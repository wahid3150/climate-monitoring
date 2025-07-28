const GHS = require("../models/GHS");
const XLSX = require("xlsx");
const path = require("path");

exports.getAllGHSData = async (req, res) => {
  try {
    const ghs = await GHS.find().sort({ year: 1 });
    res.json(ghs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.importGHSData = async () => {
  try {
    const count = await GHS.countDocuments();
    if (count > 0) {
      console.log("[GHS] Data already imported");
      return;
    }

    const filePath = path.resolve(__dirname, "../data/ghs_1947_to_2024.xlsx");
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const ghsData = data.map((row) => ({
      year: row.Year,
      co2: row.CO2,
      ch4: row.CH4,
      n2o: row.N2O,
      punjab_co2: row["Punjab CO2"],
      punjab_ch4: row["Punjab CH4"],
      punjab_n2o: row["Punjab N2O"],
      sindh_co2: row["Sindh CO2"],
      sindh_ch4: row["Sindh CH4"],
      sindh_n2o: row["Sindh N2O"],
      kpk_co2: row["KPK CO2"],
      kpk_ch4: row["KPK CH4"],
      kpk_n2o: row["KPK N2O"],
      balochistan_co2: row["Balochistan CO2"],
      balochistan_ch4: row["Balochistan CH4"],
      balochistan_n2o: row["Balochistan N2O"],
    }));

    await GHS.insertMany(ghsData);
    console.log("[GHS] Data imported successfully");
  } catch (error) {
    console.error("[GHS] Import error:", error);
  }
};
