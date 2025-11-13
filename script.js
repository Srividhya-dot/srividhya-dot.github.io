// ----------------------------------------------------
// CONFIG
// ----------------------------------------------------
const WORKER_URL = "https://black-tree-2e32.sriviadithi.workers.dev/?symbol=";

// HTML ELEMENTS
const chartDiv = document.getElementById("chart");
const volumeDiv = document.getElementById("volume");
const watchlistUL = document.getElementById("watchlist");
const spinner = document.getElementById("spinner");
const errorBox = document.getElementById("error");
const symbolTitle = document.getElementById("symbol-title");

const addInput = document.getElementById("add-stock");
const addBtn = document.getElementById("add-btn");

const tfButtons = document.querySelectorAll(".tf-btn");

let currentSymbol = "RELIANCE.NS";
let currentTF = "1D";

// GLOBAL CHART
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
        layout: { backgroundColor: "#0f1724", textColor: "#d1d4dc" },
        grid: {
            vertLines: { color: "#253248" },
            horzLines: { color: "#253248" },
        },
        timeScale: { borderColor: "#485c7b" },
        rightPriceScale: { borderColor: "#485c7b" }
    });

    candleSeries = chart.addCandlestickSeries({
        upColor: "#22c55e",
        downColor: "#ef4444",
        wickVisible: true
    });

    volumeSeries = chart.addHistogramSeries({
        priceScaleId: "",
        priceFormat: { type: "volume" },
        scaleMargins: { top: 0.8, bottom: 0 }
    });
}

// ----------------------------------------------------
// FETCH DATA
// ----------------------------------------------------
async function fetchData(symbol) {
    try {
        const res = await fetch(`${WORKER_URL}${symbol}`);
        const raw = await res.json();

        if (!Array.isArray(raw)) return { ohlc: [], volume: [] };

        const ohlc = raw.map(r => ({
            time: r.time,
            open: r.open,
            high: r.high,
            low: r.low,
            close: r.close
        }));

        // simple timeframe filter (frontend)
        let filtered = ohlc;
        if (currentTF !== "MAX") {
            const limit = {
                "1D": 390,
                "1W": 390 * 5,
                "1M": 390 * 22,
                "6M": 390 * 22 * 6,
                "1Y": 390 * 22 * 12,
                "5Y": 390 * 22 * 12 * 5
            }[currentTF];

            filtered = ohlc.slice(-limit);
        }

        const volume = filtered.map(r => ({
            time: r.time,
            value: r.volume ?? 0,
            color: r.close >= r.open ? "#22c55e" : "#ef4444"
        }));

        return { ohlc: filtered, volume };

    } catch {
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
function hideError() { errorBox.style.display = "none"; }

// ----------------------------------------------------
// LOAD CHART
// ----------------------------------------------------
async function loadChart(symbol) {
    currentSymbol = symbol;

    createChart();
    showSpinner();
    hideError();

    symbolTitle.textContent = symbol;

    const { ohlc, volume } = await fetchData(symbol);

    hideSpinner();

    if (ohlc.length === 0) {
        showError("No data available");
        return;
    }

    candleSeries.setData(ohlc);
    volumeSeries.setData(volume);

    chart.timeScale().fitContent();
}

// ----------------------------------------------------
// WATCHLIST CLICK
// ----------------------------------------------------
watchlistUL.querySelectorAll("li").forEach(li => {
    li.onclick = () => loadChart(li.dataset.symbol);
});

// ----------------------------------------------------
// ADD STOCK
// ----------------------------------------------------
let savedWatchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

savedWatchlist.forEach(symbol => addSymbolToWatchlist(symbol, false));

function addSymbolToWatchlist(symbol, save = true) {
    symbol = symbol.trim().toUpperCase();
    if (!symbol) return;

    if (!symbol.includes(".")) symbol += ".NS";

    if ([...watchlistUL.children].some(li => li.dataset.symbol === symbol)) {
        alert("Already exists in watchlist");
        return;
    }

    const li = document.createElement("li");
    li.textContent = symbol.replace(".NS", "");
    li.dataset.symbol = symbol;

    li.onclick = () => loadChart(symbol);

    watchlistUL.appendChild(li);

    if (save) {
        savedWatchlist.push(symbol);
        localStorage.setItem("watchlist", JSON.stringify(savedWatchlist));
    }
}

addBtn.onclick = () => {
    addSymbolToWatchlist(addInput.value);
    addInput.value = "";
};

addInput.onkeydown = e => {
    if (e.key === "Enter") addBtn.click();
};

// ----------------------------------------------------
// TIMEFRAME BUTTONS
// ----------------------------------------------------
tfButtons.forEach(btn => {
    btn.onclick = () => {
        tfButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentTF = btn.dataset.tf;
        loadChart(currentSymbol);
    };
});

// ----------------------------------------------------
// DEFAULT LOAD
// ----------------------------------------------------
loadChart("RELIANCE.NS");
