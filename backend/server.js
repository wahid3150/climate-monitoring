require("dotenv").config({ path: "./config/.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const temperatureRoutes = require("./routes/temperatureRoutes");
const glacierRoutes = require("./routes/glacierRoutes");
const ghsRoutes = require("./routes/ghsRoutes");

const temperatureController = require("./controllers/temperatureController");
const glacierController = require("./controllers/glacierController");
const ghsController = require("./controllers/ghsController");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);

mongoose.connection.once("open", async () => {
  console.log("Connected to MongoDB");
  // Import data into the database if not already present
  await temperatureController.importTemperatureData();
  await glacierController.importGlacierData();
  await ghsController.importGHSData();
});

app.use("/api", temperatureRoutes);
app.use("/api", glacierRoutes);
app.use("/api", ghsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
