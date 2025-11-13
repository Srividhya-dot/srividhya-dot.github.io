// -----------------------------
// CONFIG
// -----------------------------
const WORKER_URL = "https://black-tree-2e32.sriviadithi.workers.dev/?symbol=";

// HTML elements
const chartEl = document.getElementById("chart");
const volumeEl = document.getElementById("volume");
const spinner = document.getElementById("spinner");
const errorBox = document.getElementById("error");
const symbolTitle = document.getElementById("symbol-title");
const watchlistItems = document.querySelectorAll("#watchlist li");

// Global chart objects
let chart, candleSeries, volumeSeries;

// -----------------------------
// CREATE CHART (once only)
// -----------------------------
function createChart() {
    if (chart) return chart;

    chart = LightweightCharts.createChart(chartEl, {
        layout: {
            background: { color: "#0f1724" },
            textColor: "#e6eef8",
        },
        grid: {
            vertLines: { color: "#1c263b" },
            horzLines: { color: "#1c263b" },
        },
        timeScale: {
            borderColor: "#334155",
        },
        rightPriceScale: {
            borderColor: "#334155",
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
    });

    // Candle series
    candleSeries = chart.addCandlestickSeries({
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderVisible: false,
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
    });

    // Volume series
    volumeSeries = chart.addHistogramSeries({
        priceFormat: { type: "volume" },
        color: "#60a5fa33",
        priceScaleId: "",
    });

    return chart;
}

// -----------------------------
// FETCH WORKER API
// -----------------------------
async function fetchData(symbol) {
    try {
        const response = await fetch(WORKER_URL + symbol);

        // Worker returns valid JSON
        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Worker returned invalid data");
        }

        return data;

    } catch (err) {
        return { error: true, message: err.message };
    }
}

// -----------------------------
// LOAD CHART + UPDATE UI
// -----------------------------
async function loadChart(symbol) {
    spinner.classList.remove("hidden");
    errorBox.style.display = "none";

    createChart();
    symbolTitle.textContent = symbol;

    const result = await fetchData(symbol);

    spinner.classList.add("hidden");

    if (result.error) {
        errorBox.textContent = "Error loading data: " + result.message;
        errorBox.style.display = "block";
        return;
    }

    candleSeries.setData(result);

    // Create volume bars
    const volumeBars = result.map(c => ({
        time: c.time,
        value: c.volume ?? Math.floor(Math.random() * 200000),
        color: c.close >= c.open ? "#22c55e44" : "#ef444444",
    }));

    volumeSeries.setData(volumeBars);
}

// -----------------------------
// WATCHLIST CLICK HANDLER
// -----------------------------
watchlistItems.forEach(item => {
    item.addEventListener("click", () => {
        watchlistItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        loadChart(item.dataset.symbol);
    });
});

// -----------------------------
// AUTO RESIZE
// -----------------------------
new ResizeObserver(() => {
    if (chart) {
        chart.applyOptions({
            width: chartEl.clientWidth,
            height: chartEl.clientHeight,
        });
    }
}).observe(chartEl);

// -----------------------------
// LOAD DEFAULT STOCK
// -----------------------------
loadChart("RELIANCE.NS");
