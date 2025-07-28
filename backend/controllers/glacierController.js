const Glacier = require("../models/glacier");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

exports.getAllGlaciers = async (req, res) => {
  try {
    const glaciers = await Glacier.find();
    res.json(glaciers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

exports.importGlacierData = async () => {
  try {
    const count = await Glacier.countDocuments();
    if (count > 0) {
      console.log("[Glacier] Data already imported");
      return;
    }

    const filePath = path.resolve(
      __dirname,
      "../data/pakistan_glacier_metadata.csv"
    );
    const glacierData = await parseCSV(filePath);

    await Glacier.insertMany(glacierData);
    console.log("[Glacier] Data imported successfully");
  } catch (error) {
    console.error("[Glacier] Import error:", error);
  }
};
