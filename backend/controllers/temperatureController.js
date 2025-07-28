const Temperature = require("../models/temperature");
const XLSX = require("xlsx");
const path = require("path");

exports.getAllTemperatureData = async (req, res) => {
  try {
    const temperature = await Temperature.find().sort({ year: 1 });
    res.json(temperature);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.importTemperatureData = async () => {
  try {
    const count = await Temperature.countDocuments();
    if (count > 0) {
      console.log("[Temperature] Data already imported");
      return;
    }

    const filePath = path.resolve(
      __dirname,
      "../data/temperature_1901_2024.xlsx"
    );
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const temperatureData = data.map((row) => ({
      year: row.Year,
      punjab: row.Punjab,
      sindh: row.Sindh,
      kpk: row.KPK,
      balochistan: row.Balochistan,
    }));

    await Temperature.insertMany(temperatureData);
    console.log("[Temperature] Data imported successfully");
  } catch (error) {
    console.error("[Temperature] Import error:", error);
  }
};
