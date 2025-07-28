let ghsChart = null;
let temperatureChart = null;
let provinceMap = null;
let glacierMap = null;
let ghsData = [];
let temperatureData = [];
let glacierData = [];

// API Base URL
const API_BASE = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

async function initializeApp() {
  try {
    showLoading();

    // Load data from backend
    await loadAllData();

    // Initialize UI components
    initializeTabs();
    initializeFAQ();
    initializeAnimations();

    // Initialize charts and maps
    initializeGHSChart();
    initializeTemperatureChart();
    initializeProvinceMap();
    initializeGlacierMap();

    handleVideoPlayback();

    hideLoading();
  } catch (error) {
    console.error("Error initializing app:", error);
    showError("Failed to load climate data. Please check your connection.");
    hideLoading();

    // Load sample data as fallback
    loadSampleData();
    initializeGHSChart();
    initializeTemperatureChart();
    initializeProvinceMap();
    initializeGlacierMap();
    handleVideoPlayback();
  }
}

// Data loading functions
async function loadAllData() {
  try {
    const [ghsResponse, temperatureResponse, glacierResponse] =
      await Promise.all([
        fetch(`${API_BASE}/ghs`),
        fetch(`${API_BASE}/temperature`),
        fetch(`${API_BASE}/glaciers`),
      ]);

    if (!ghsResponse.ok || !temperatureResponse.ok || !glacierResponse.ok) {
      throw new Error("Failed to fetch data from server");
    }

    ghsData = await ghsResponse.json();
    temperatureData = await temperatureResponse.json();
    glacierData = await glacierResponse.json();

    console.log("Data loaded successfully:", {
      ghs: ghsData.length,
      temperature: temperatureData.length,
      glaciers: glacierData.length,
    });
  } catch (error) {
    console.error("Error loading data:", error);
    throw error;
  }
}

function loadSampleData() {
  // Sample GHS data
  ghsData = generateSampleGHSData();
  temperatureData = generateSampleTemperatureData();
  glacierData = generateSampleGlacierData();
}

function generateSampleGHSData() {
  const data = [];
  for (let year = 1947; year <= 2024; year++) {
    const baseValue = Math.exp((year - 1947) * 0.05);
    data.push({
      year: year,
      co2: baseValue * (50 + Math.random() * 20),
      ch4: baseValue * (5 + Math.random() * 2),
      n2o: baseValue * (2 + Math.random() * 1),
      punjab_co2: baseValue * (20 + Math.random() * 8),
      punjab_ch4: baseValue * (2 + Math.random() * 0.8),
      punjab_n2o: baseValue * (0.8 + Math.random() * 0.4),
      sindh_co2: baseValue * (15 + Math.random() * 6),
      sindh_ch4: baseValue * (1.5 + Math.random() * 0.6),
      sindh_n2o: baseValue * (0.6 + Math.random() * 0.3),
      kpk_co2: baseValue * (8 + Math.random() * 3),
      kpk_ch4: baseValue * (0.8 + Math.random() * 0.3),
      kpk_n2o: baseValue * (0.3 + Math.random() * 0.15),
      balochistan_co2: baseValue * (7 + Math.random() * 3),
      balochistan_ch4: baseValue * (0.7 + Math.random() * 0.3),
      balochistan_n2o: baseValue * (0.3 + Math.random() * 0.15),
    });
  }
  return data;
}

function generateSampleTemperatureData() {
  const data = [];
  for (let year = 1947; year <= 2024; year++) {
    const trend = (year - 1947) * 0.008;
    data.push({
      year: year.toString(),
      punjab: 24.5 + trend + (Math.random() - 0.5) * 2,
      sindh: 26.2 + trend + (Math.random() - 0.5) * 2,
      kpk: 19.8 + trend + (Math.random() - 0.5) * 2,
      balochistan: 22.1 + trend + (Math.random() - 0.5) * 2,
    });
  }
  return data;
}

function generateSampleGlacierData() {
  const data = [];
  const regions = ["Karakoram", "Hindukush", "Himalaya"];

  for (let i = 0; i < 1000; i++) {
    data.push({
      id: i + 1,
      names: `Glacier_${i + 1}`,
      latitude: 35 + Math.random() * 3,
      longitude: 72 + Math.random() * 6,
      gtng_region: regions[Math.floor(Math.random() * regions.length)],
      glims_id: `G${String(i + 1).padStart(6, "0")}`,
      area: Math.random() * 50 + 0.1,
    });
  }
  return data;
}

function initializeTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;

      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(targetTab).classList.add("active");

      // Initialize specific functionality based on tab
      switch (targetTab) {
        case "ghg-tab":
          initializeGHSChart();
          break;
        case "temperature-tab":
          initializeTemperatureChart();
          break;
        case "province-tab":
          initializeProvinceMap();
          break;
        case "glacier-tab":
          initializeGlacierMap();
          break;
      }
    });
  });
}

// GHS Chart functionality
function initializeGHSChart() {
  const ctx = document.getElementById("ghsChart");
  if (!ctx) return;

  // Initialize gas type filters
  initializeGasFilters();

  // Initialize chart options
  initializeChartOptions();

  // Draw initial chart
  drawGHSChart(["co2"], "all");
}

function initializeGasFilters() {
  const gasCheckboxes = document.querySelectorAll(
    '.gas-option input[type="checkbox"]'
  );
  gasCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateGHSChart);
  });
}

function initializeChartOptions() {
  const chartTypeSelect = document.getElementById("chartType");
  const trendlineCheckbox = document.getElementById("showTrendline");

  if (chartTypeSelect) {
    chartTypeSelect.addEventListener("change", updateGHSChart);
  }

  if (trendlineCheckbox) {
    trendlineCheckbox.addEventListener("change", updateGHSChart);
  }

  const provinceFilter = document.getElementById("provinceFilter");
  if (provinceFilter) {
    provinceFilter.addEventListener("change", updateGHSChart);
  }

  // Export functionality
  const exportBtn = document.querySelector(".export-btn");
  const shareBtn = document.querySelector(".share-btn");

  if (exportBtn) {
    exportBtn.addEventListener("click", exportGHSData);
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", shareGHSData);
  }
}

function updateGHSChart() {
  const selectedGases = [];
  const gasCheckboxes = document.querySelectorAll(
    '.gas-option input[type="checkbox"]:checked'
  );
  const provinceFilter = document.getElementById("provinceFilter");
  const selectedProvince = provinceFilter ? provinceFilter.value : "all";

  gasCheckboxes.forEach((checkbox) => {
    selectedGases.push(checkbox.value);
  });

  if (selectedGases.length > 0) {
    drawGHSChart(selectedGases, selectedProvince);
    updateOverviewCards(selectedGases[0], selectedProvince); // Update cards based on first selected gas and province
  }
}

function drawGHSChart(selectedGases, selectedProvince) {
  const ctx = document.getElementById("ghsChart");
  if (!ctx) return;

  // Destroy existing chart
  if (ghsChart) {
    ghsChart.destroy();
  }

  const chartType = document.getElementById("chartType")?.value || "line";
  const showTrendline =
    document.getElementById("showTrendline")?.checked || false;

  const datasets = [];
  const colors = {
    co2: "#e74c3c",
    ch4: "#3498db",
    n2o: "#27ae60",
  };

  selectedGases.forEach((gas) => {
    const data = ghsData.map((item) => ({
      x: item.year,
      y:
        selectedProvince === "all"
          ? item[gas]
          : item[`${selectedProvince}_${gas}`],
    }));

    datasets.push({
      label: gas.toUpperCase(),
      data: data,
      borderColor: colors[gas],
      backgroundColor: chartType === "area" ? colors[gas] + "20" : colors[gas],
      fill: chartType === "area",
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 5,
    });
  });

  // Update chart title
  const chartTitle = document.getElementById("chartTitle");
  if (chartTitle) {
    const gasNames = selectedGases.map((gas) => gas.toUpperCase()).join(", ");
    const provinceName =
      selectedProvince === "all"
        ? "Pakistan"
        : selectedProvince.charAt(0).toUpperCase() + selectedProvince.slice(1);
    chartTitle.textContent = `${gasNames} Emissions in ${provinceName} (1947-2024)`;
  }

  ghsChart = new Chart(ctx, {
    type: chartType === "area" ? "line" : chartType,
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: "Year",
          },
        },
        y: {
          title: {
            display: true,
            text: "Emissions (Mt)",
          },
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
    },
  });
}

function updateOverviewCards(gasType, selectedProvince) {
  if (!ghsData.length) return;

  const gasData = ghsData
    .map((item) =>
      selectedProvince === "all"
        ? item[gasType]
        : item[`${selectedProvince}_${gasType}`]
    )
    .filter((val) => val !== undefined);

  if (gasData.length === 0) return;

  const latest = gasData[gasData.length - 1];
  const average = gasData.reduce((sum, val) => sum + val, 0) / gasData.length;
  const peak = Math.max(...gasData);
  const lowest = Math.min(...gasData);

  // Update overview cards
  const overviewCards = document.querySelectorAll(".overview-card");
  if (overviewCards.length >= 4) {
    overviewCards[0].querySelector(
      ".overview-value"
    ).textContent = `${latest.toFixed(3)} Mt`;
    overviewCards[1].querySelector(
      ".overview-value"
    ).textContent = `${average.toFixed(1)} Mt`;
    overviewCards[2].querySelector(
      ".overview-value"
    ).textContent = `${peak.toFixed(3)} Mt`;
    overviewCards[3].querySelector(
      ".overview-value"
    ).textContent = `${lowest.toFixed(3)} Mt`;
  }
}

function exportGHSData() {
  if (!ghsData.length) return;

  const csvContent = convertToCSV(ghsData);
  downloadCSV(csvContent, "pakistan_ghs_emissions.csv");
}

function shareGHSData() {
  if (navigator.share) {
    navigator.share({
      title: "Pakistan GHS Emissions Data",
      text: "Check out this climate data from Pakistan",
      url: window.location.href,
    });
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert("URL copied to clipboard!");
    });
  }
}

// Temperature Chart
function initializeTemperatureChart() {
  const ctx = document.getElementById("temperatureChart");
  if (!ctx) return;

  if (temperatureChart) {
    temperatureChart.destroy();
  }

  const datasets = [
    {
      label: "Punjab",
      data: temperatureData.map((item) => ({
        x: parseInt(item.year),
        y: item.punjab,
      })),
      borderColor: "#e74c3c",
      backgroundColor: "#e74c3c20",
      tension: 0.4,
    },
    {
      label: "Sindh",
      data: temperatureData.map((item) => ({
        x: parseInt(item.year),
        y: item.sindh,
      })),
      borderColor: "#3498db",
      backgroundColor: "#3498db20",
      tension: 0.4,
    },
    {
      label: "KPK",
      data: temperatureData.map((item) => ({
        x: parseInt(item.year),
        y: item.kpk,
      })),
      borderColor: "#27ae60",
      backgroundColor: "#27ae6020",
      tension: 0.4,
    },
    {
      label: "Balochistan",
      data: temperatureData.map((item) => ({
        x: parseInt(item.year),
        y: item.balochistan,
      })),
      borderColor: "#f39c12",
      backgroundColor: "#f39c1220",
      tension: 0.4,
    },
  ];

  temperatureChart = new Chart(ctx, {
    type: "line",
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: "Year",
          },
        },
        y: {
          title: {
            display: true,
            text: "Temperature (°C)",
          },
        },
      },
    },
  });
}

// Province Map with Boundaries
function initializeProvinceMap() {
  const mapContainer = document.getElementById("provinceMap");
  if (!mapContainer) return;

  if (provinceMap) {
    provinceMap.remove();
  }

  provinceMap = L.map("provinceMap").setView([30.3753, 69.3451], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(provinceMap);

  // Initialize province emissions controls
  initializeProvinceControls();

  // Draw initial province boundaries
  drawProvinceBoundaries("co2");
}

function initializeProvinceControls() {
  const gasButtons = document.querySelectorAll("#province-tab .gas-btn");
  gasButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      gasButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      drawProvinceBoundaries(btn.dataset.gas);
    });
  });
}

function drawProvinceBoundaries(gasType) {
  if (!provinceMap) return;

  // Clear existing layers
  provinceMap.eachLayer((layer) => {
    if (layer instanceof L.Polygon) {
      provinceMap.removeLayer(layer);
    }
  });

  // Get latest emissions data for provinces
  const latestData = ghsData[ghsData.length - 1] || {};

  const provinces = [
    {
      name: "Punjab",
      bounds: [
        [32.0836, 73.7089], // Lahore area
        [33.6844, 73.0479], // Islamabad area
        [33.6007, 72.97], // Rawalpindi
        [32.4945, 74.5229], // Sialkot
        [31.5804, 74.3587], // Lahore
        [30.3753, 71.4687], // Southern Punjab
        [29.3956, 71.6836], // Bahawalpur
        [30.1575, 72.3126], // Multan
        [31.4504, 73.135], // Faisalabad
        [32.0836, 73.7089], // Close the polygon
      ],
      value: latestData[`punjab_${gasType}`] || Math.random() * 50 + 30,
      center: [31.1471, 72.7478],
    },
    {
      name: "Sindh",
      bounds: [
        [24.8607, 67.0011], // Karachi
        [25.396, 68.3578], // Hyderabad
        [27.7056, 68.2177], // Sukkur
        [28.4212, 70.2989], // Northern Sindh
        [26.9124, 70.9017], // Eastern border
        [25.3219, 69.0183], // Central Sindh
        [24.9056, 66.9889], // Coastal area
        [24.8607, 67.0011], // Close the polygon
      ],
      value: latestData[`sindh_${gasType}`] || Math.random() * 40 + 20,
      center: [25.8943, 68.5247],
    },
    {
      name: "KPK",
      bounds: [
        [34.0151, 71.5249], // Peshawar
        [35.9078, 74.3441], // Northern areas
        [36.3167, 74.2167], // Chitral area
        [35.1667, 71.8333], // Dir area
        [34.9526, 72.3311], // Swat
        [34.1688, 72.2], // Mardan
        [33.9937, 71.4697], // Charsadda
        [33.6844, 73.0479], // Border with Punjab
        [34.0151, 71.5249], // Close the polygon
      ],
      value: latestData[`kpk_${gasType}`] || Math.random() * 25 + 10,
      center: [34.0151, 71.5249],
    },
    {
      name: "Balochistan",
      bounds: [
        [25.3219, 61.9253], // Gwadar area
        [26.2041, 63.256], // Coastal region
        [28.3588, 65.0377], // Central Balochistan
        [30.2518, 66.975], // Northern Balochistan
        [31.5804, 69.4056], // Border areas
        [29.0588, 69.3389], // Eastern border
        [27.0238, 67.8658], // Central areas
        [25.8943, 66.5947], // Southern areas
        [25.3219, 61.9253], // Close the polygon
      ],
      value: latestData[`balochistan_${gasType}`] || Math.random() * 15 + 5,
      center: [27.5142, 65.8249],
    },
  ];

  // Calculate color based on emission levels with better scaling
  const values = provinces.map((p) => p.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue;

  provinces.forEach((province) => {
    const intensity = range > 0 ? (province.value - minValue) / range : 0.5;
    const color = getAdvancedEmissionColor(intensity, gasType);

    const polygon = L.polygon(province.bounds, {
      color: color.border,
      fillColor: color.fill,
      fillOpacity: 0.7,
      weight: 3,
      opacity: 0.9,
      className: `province-${province.name.toLowerCase()}`,
    }).addTo(provinceMap);

    // Enhanced popup with more information
    polygon.bindPopup(`
      <div style="font-family: Arial, sans-serif; min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; color: #2c3e50; border-bottom: 2px solid ${
          color.fill
        }; padding-bottom: 5px;">
          ${province.name}
        </h3>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <div style="width: 20px; height: 20px; background: ${
            color.fill
          }; border-radius: 3px; margin-right: 10px; border: 1px solid ${
      color.border
    };"></div>
          <strong>${gasType.toUpperCase()} Emissions: ${province.value.toFixed(
      2
    )} Mt</strong>
        </div>
        <div style="font-size: 12px; color: #7f8c8d;">
          Emission Level: ${getEmissionLevel(intensity)}<br>
          Province Center: ${province.center[0].toFixed(
            4
          )}, ${province.center[1].toFixed(4)}
        </div>
      </div>
    `);

    // Add hover effects
    polygon.on("mouseover", function (e) {
      this.setStyle({
        weight: 4,
        fillOpacity: 0.8,
      });
    });

    polygon.on("mouseout", function (e) {
      this.setStyle({
        weight: 3,
        fillOpacity: 0.7,
      });
    });
  });

  // Add enhanced legend
  addEnhancedMapLegend(gasType, provinces);
}

function getAdvancedEmissionColor(intensity, gasType) {
  // Different color schemes for different gases
  const colorSchemes = {
    co2: {
      low: { fill: "#27ae60", border: "#229954" }, // Green
      medium: { fill: "#f39c12", border: "#e67e22" }, // Orange
      high: { fill: "#e74c3c", border: "#c0392b" }, // Red
    },
    ch4: {
      low: { fill: "#3498db", border: "#2980b9" }, // Blue
      medium: { fill: "#9b59b6", border: "#8e44ad" }, // Purple
      high: { fill: "#e91e63", border: "#ad1457" }, // Pink
    },
    n2o: {
      low: { fill: "#1abc9c", border: "#16a085" }, // Teal
      medium: { fill: "#f1c40f", border: "#f39c12" }, // Yellow
      high: { fill: "#e67e22", border: "#d35400" }, // Dark Orange
    },
  };

  const scheme = colorSchemes[gasType] || colorSchemes.co2;

  if (intensity < 0.33) return scheme.low;
  if (intensity < 0.66) return scheme.medium;
  return scheme.high;
}

function getEmissionLevel(intensity) {
  if (intensity < 0.33) return "Low";
  if (intensity < 0.66) return "Medium";
  return "High";
}

function addEnhancedMapLegend(gasType, provinces) {
  // Remove existing legend
  const existingLegend = document.querySelector(".map-legend");
  if (existingLegend) {
    existingLegend.remove();
  }

  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "map-legend");

    // Calculate statistics
    const values = provinces.map((p) => p.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;

    div.innerHTML = `
      <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); font-family: Arial, sans-serif;">
        <h4 style="margin: 0 0 12px 0; color: #2c3e50; font-size: 16px; border-bottom: 2px solid #3498db; padding-bottom: 5px;">
          ${gasType.toUpperCase()} Emissions (Mt)
        </h4>
        <div style="margin-bottom: 12px;">
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <div style="width: 20px; height: 15px; background: ${
              getAdvancedEmissionColor(0.1, gasType).fill
            }; margin-right: 8px; border-radius: 3px; border: 1px solid ${
      getAdvancedEmissionColor(0.1, gasType).border
    };"></div>
            <span style="font-size: 13px;">Low (${minValue.toFixed(1)} - ${(
      minValue +
      (maxValue - minValue) * 0.33
    ).toFixed(1)})</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <div style="width: 20px; height: 15px; background: ${
              getAdvancedEmissionColor(0.5, gasType).fill
            }; margin-right: 8px; border-radius: 3px; border: 1px solid ${
      getAdvancedEmissionColor(0.5, gasType).border
    };"></div>
            <span style="font-size: 13px;">Medium (${(
              minValue +
              (maxValue - minValue) * 0.33
            ).toFixed(1)} - ${(minValue + (maxValue - minValue) * 0.66).toFixed(
      1
    )})</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <div style="width: 20px; height: 15px; background: ${
              getAdvancedEmissionColor(0.9, gasType).fill
            }; margin-right: 8px; border-radius: 3px; border: 1px solid ${
      getAdvancedEmissionColor(0.9, gasType).border
    };"></div>
            <span style="font-size: 13px;">High (${(
              minValue +
              (maxValue - minValue) * 0.66
            ).toFixed(1)} - ${maxValue.toFixed(1)})</span>
          </div>
        </div>
        <div style="font-size: 11px; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 8px;">
          <div>Max: ${maxValue.toFixed(2)} Mt</div>
          <div>Avg: ${avgValue.toFixed(2)} Mt</div>
          <div>Min: ${minValue.toFixed(2)} Mt</div>
        </div>
      </div>
    `;
    return div;
  };
  legend.addTo(provinceMap);
}

function getEmissionColor(intensity) {
  if (intensity < 0.33) return "#27ae60"; // Green for low
  if (intensity < 0.66) return "#f39c12"; // Orange for medium
  return "#e74c3c"; // Red for high
}

function addMapLegend(gasType) {
  // Remove existing legend
  const existingLegend = document.querySelector(".map-legend");
  if (existingLegend) {
    existingLegend.remove();
  }

  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "map-legend");
    div.innerHTML = `
            <h4>${gasType.toUpperCase()} Emissions</h4>
            <div><span style="background: #27ae60;"></span> Low</div>
            <div><span style="background: #f39c12;"></span> Medium</div>
            <div><span style="background: #e74c3c;"></span> High</div>
        `;
    return div;
  };
  legend.addTo(provinceMap);
}

// Glacier Map
function initializeGlacierMap() {
  const mapContainer = document.getElementById("glacierMap");
  if (!mapContainer) return;

  if (glacierMap) {
    glacierMap.remove();
  }

  glacierMap = L.map("glacierMap").setView([35.9078, 74.3441], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(glacierMap);

  // Add all glaciers to map without any filtering
  addAllGlaciersToMap();
}

function addAllGlaciersToMap() {
  if (!glacierData.length) return;

  // Show all glaciers without any limit or filtering
  glacierData.forEach((glacier) => {
    const marker = L.circleMarker([glacier.latitude, glacier.longitude], {
      radius: 4,
      fillColor: "#3498db",
      color: "#2980b9",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    }).addTo(glacierMap);

    marker.bindPopup(`
      <div style="font-family: Arial, sans-serif; min-width: 180px;">
        <h4 style="margin: 0 0 8px 0; color: #2c3e50; border-bottom: 1px solid #3498db; padding-bottom: 4px;">
          ${glacier.names || "Unnamed Glacier"}
        </h4>
        <div style="font-size: 13px; margin-bottom: 4px;">
          <strong>GLIMS ID:</strong> ${glacier.glims_id || "N/A"}
        </div>
        <div style="font-size: 13px; margin-bottom: 4px;">
          <strong>Region:</strong> ${glacier.gtng_region || "N/A"}
        </div>
        <div style="font-size: 13px; color: #7f8c8d;">
          <strong>Coordinates:</strong> ${glacier.latitude.toFixed(
            4
          )}, ${glacier.longitude.toFixed(4)}
        </div>
      </div>
    `);
  });

  // Add glacier information panel
  addGlacierInfoPanel(glacierData.length);
}

function addGlacierInfoPanel(totalGlaciers) {
  const info = L.control({ position: "topright" });
  info.onAdd = function () {
    const div = L.DomUtil.create("div", "glacier-info");
    div.innerHTML = `
      <div style="background: white; padding: 12px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-family: Arial, sans-serif;">
        <h4 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 14px;">
          <i class="fas fa-mountain" style="color: #3498db; margin-right: 6px;"></i>
          Glacier Information
        </h4>
        <div style="font-size: 13px; color: #34495e;">
          <div style="margin-bottom: 4px;">
            <strong>Total Glaciers:</strong> ${totalGlaciers.toLocaleString()}
          </div>
          <div style="font-size: 11px; color: #7f8c8d; margin-top: 6px;">
            All glaciers are displayed without filtering
          </div>
        </div>
      </div>
    `;
    return div;
  };
  info.addTo(glacierMap);
}

// FAQ functionality
function initializeFAQ() {
  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", () => {
      const item = question.parentNode;
      item.classList.toggle("active");

      // Close other open items
      document.querySelectorAll(".faq-item").forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active");
        }
      });
    });
  });
}

// Animation functionality
function initializeAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  document.querySelectorAll(".animate-text").forEach((el) => {
    observer.observe(el);
  });
}

// Utility functions
function showLoading() {
  const loading = document.querySelector(".loading-indicator");
  if (loading) {
    loading.classList.add("show");
  }
}

function hideLoading() {
  const loading = document.querySelector(".loading-indicator");
  if (loading) {
    loading.classList.remove("show");
  }
}

function showError(message) {
  const error = document.querySelector(".error-message");
  if (error) {
    error.querySelector("span").textContent = message;
    error.classList.add("show");
    setTimeout(() => {
      error.classList.remove("show");
    }, 5000);
  }
}

function convertToCSV(data) {
  if (!data.length) return "";

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) => headers.map((header) => row[header]).join(",")),
  ].join("\n");

  return csvContent;
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Add CSS for map legend and glacier info
const style = document.createElement("style");
style.textContent = `
    .map-legend {
        background: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    
    .map-legend h4 {
        margin: 0 0 10px 0;
        font-size: 14px;
    }
    
    .map-legend div {
        display: flex;
        align-items: center;
        margin-bottom: 5px;
    }
    
    .map-legend span {
        width: 20px;
        height: 15px;
        margin-right: 8px;
        border-radius: 3px;
    }
    
    .glacier-info {
        background: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    
    .glacier-info h4 {
        margin: 0 0 5px 0;
        font-size: 14px;
    }
    
    .glacier-info p {
        margin: 0;
        font-size: 12px;
        color: #666;
    }
`;
document.head.appendChild(style);

function handleVideoPlayback() {
  const video = document.querySelector(".hero-video");
  const heroFallback = document.querySelector(".hero-fallback");

  if (video) {
    // Listen for errors during video loading/playback
    video.addEventListener("error", (e) => {
      console.error("Video playback error:", e);
      if (heroFallback) {
        heroFallback.style.display = "block";
      }
    });

    // Attempt to play the video
    video
      .play()
      .then(() => {
        console.log("Video started playing successfully.");
        if (heroFallback) {
          heroFallback.style.display = "none"; // Hide fallback if video plays
        }
      })
      .catch((error) => {
        console.warn("Video autoplay prevented or failed:", error);
        // If autoplay is prevented, ensure the fallback is visible
        if (heroFallback) {
          heroFallback.style.display = "block";
        }
      });
  } else {
    console.warn("Hero video element not found.");
    if (heroFallback) {
      heroFallback.style.display = "block"; // Ensure fallback is visible if video element is missing
    }
  }
}
