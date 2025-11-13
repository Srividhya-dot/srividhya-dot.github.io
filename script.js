// ----------------------------------------------------
// CONFIG
// ----------------------------------------------------
const WORKER_URL = "https://black-tree-2e32.sriviadithi.workers.dev/?symbol=";

// HTML references
const chartDiv = document.getElementById("chart");
const watchlistItems = document.querySelectorAll("#watchlist li");
const spinner = document.getElementById("spinner");
const errorBox = document.getElementById("error");
const symbolTitle = document.getElementById("symbol-title");
const volumeDiv = document.getElementById("volume");

// Global chart + series
let chart = null;
let candleSeries = null;
let volumeSeries = null;

// ----------------------------------------------------
// CREATE CHART
// ----------------------------------------------------
function createChart() {
    if (chart) return;

    chart = LightweightCharts.createChart(chartDiv, {
        width: chartDiv.clientWidth,
        height: chartDiv.clientHeight,
        layout: {
            backgroundColor: "#0f1724",
            textColor: "#d1d4dc",
        },
        grid: {
            vertLines: { color: "#253248" },
            horzLines: { color: "#253248" },
        },
        timeScale: { borderColor: "#485c7b" },
        rightPriceScale: { borderColor: "#485c7b" },
    });

    candleSeries = chart.addCandlestickSeries({
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderVisible: true,
        wickVisible: true,
    });

    volumeSeries = chart.addHistogramSeries({
        priceFormat: { type: "volume" },
        color: "#4c78ff",
        priceScaleId: "",
        scaleMargins: { top: 0.8, bottom: 0 },
    });
}

// ----------------------------------------------------
// FETCH DATA
// ----------------------------------------------------
async function fetchData(symbol) {
    try {
        const response = await fetch(WORKER_URL + symbol);

        if (!response.ok) throw new Error("HTTP error");

        const raw = await response.json();
        if (!Array.isArray(raw)) return { ohlc: [], volume: [] };

        const ohlc = raw.map(r => ({
            time: r.time,
            open: r.open,
            high: r.high,
            low: r.low,
            close: r.close,
        }));

        const volume = raw.map(r => ({
            time: r.time,
            value: r.volume ?? 0,
            color: r.close >= r.open ? "#22c55e" : "#ef4444",
        }));

        return { ohlc, volume };
    } catch (err) {
        showError("Failed to fetch data");
        return { ohlc: [], volume: [] };
    }
}

// ----------------------------------------------------
// UI HELPERS
// ----------------------------------------------------
function showSpinner() { spinner.classList.remove("hidden"); }
function hideSpinner() { spinner.classList.add("hidden"); }

function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = "block";
}
function hideError() {
    errorBox.style.display = "none";
}

// ----------------------------------------------------
// LOAD CHART
// ----------------------------------------------------
async function loadChart(symbol) {
    console.log("Loading:", symbol);

    createChart();
    showSpinner();
    hideError();

    symbolTitle.textContent = symbol;

    // Highlight selected watchlist item
    watchlistItems.forEach(li => li.classList.remove("active"));
    document.querySelector(`[data-symbol="${symbol}"]`)?.classList.add("active");

    const { ohlc, volume } = await fetchData(symbol);

    hideSpinner();

    if (ohlc.length === 0) {
        showError("No chart data returned.");
        return;
    }

    candleSeries.setData(ohlc);
    volumeSeries.setData(volume);

    chart.timeScale().fitContent();
}

// ----------------------------------------------------
// WATCHLIST CLICK EVENTS
// ----------------------------------------------------
watchlistItems.forEach(li => {
    li.addEventListener("click", () => {
        const symbol = li.dataset.symbol;
        loadChart(symbol);
    });
});

// ----------------------------------------------------
// LOAD DEFAULT CHART
// ----------------------------------------------------
loadChart("RELIANCE.NS");
