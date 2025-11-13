// ----------------------------------------------------
// CONFIG
// ----------------------------------------------------
const WORKER_URL = "https://black-tree-2e32.sriviadithi.workers.dev/?symbol=";

// HTML references
const chartDiv = document.getElementById("chart");
const watchlist = document.getElementById("watchlist");
const addInput = document.getElementById("add-stock");
const addBtn = document.getElementById("add-btn");

const timeframeBtns = document.querySelectorAll(".tf-btn");

const spinner = document.getElementById("spinner");
const errorBox = document.getElementById("error");
const symbolTitle = document.getElementById("symbol-title");

// GLOBALS
let chart = null;
let candleSeries = null;
let volumeSeries = null;
let currentSymbol = "RELIANCE.NS";
let currentTimeframe = "1D";

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
        priceScaleId: "",
        scaleMargins: { top: 0.8, bottom: 0 }
    });
}

// ----------------------------------------------------
// FETCH OHLC + LIVE PRICE
// ----------------------------------------------------
async function fetchData(symbol, tf) {
    try {
        const response = await fetch(`${WORKER_URL}${symbol}&tf=${tf}`);
        if (!response.ok) throw new Error();

        const raw = await response.json();
        if (!Array.isArray(raw)) return { ohlc: [], volume: [], last: null };

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

        return { ohlc, volume, last: raw[raw.length - 1] };

    } catch {
        return { ohlc: [], volume: [], last: null };
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
// UPDATE LIVE PRICE IN WATCHLIST
// ----------------------------------------------------
async function updateWatchlistPrice(symbol, liEl) {
    const { last } = await fetchData(symbol, "1D");

    if (!last) return;

    const price = last.close.toFixed(2);
    const change = last.close - last.open;
    const isUp = change >= 0;

    liEl.innerHTML = `
        <span>${symbol}</span>
        <span style="color:${isUp ? "#22c55e" : "#ef4444"}">
            ${price}
        </span>
    `;
}

// ----------------------------------------------------
// LOAD CHART
// ----------------------------------------------------
async function loadChart(symbol) {
    currentSymbol = symbol;
    hideError();
    showSpinner();

    createChart();
    symbolTitle.textContent = symbol;

    // highlight active
    document.querySelectorAll("#watchlist li").forEach(li => li.classList.remove("active"));
    document.querySelector(`[data-symbol="${symbol}"]`)?.classList.add("active");

    const { ohlc, volume } = await fetchData(symbol, currentTimeframe);

    hideSpinner();

    if (ohlc.length === 0) {
        showError("No chart data.");
        return;
    }

    candleSeries.setData(ohlc);
    volumeSeries.setData(volume);
    chart.timeScale().fitContent();
}

// ----------------------------------------------------
// ADD NEW STOCK TO WATCHLIST
// ----------------------------------------------------
function addStock() {
    const symbol = addInput.value.trim().toUpperCase();
    if (!symbol) return;

    const li = document.createElement("li");
    li.dataset.symbol = symbol;
    li.textContent = symbol;

    li.onclick = () => loadChart(symbol);

    watchlist.appendChild(li);

    updateWatchlistPrice(symbol, li);
    addInput.value = "";
}

// ----------------------------------------------------
// TIMEFRAME BUTTONS
// ----------------------------------------------------
timeframeBtns.forEach(btn => {
    btn.onclick = () => {
        timeframeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentTimeframe = btn.dataset.tf;
        loadChart(currentSymbol);
    };
});

// ----------------------------------------------------
// INITIAL LOAD + REFRESH LIVE PRICES EVERY 60 SEC
// ----------------------------------------------------
loadChart(currentSymbol);

setInterval(() => {
    document.querySelectorAll("#watchlist li").forEach(li => {
        updateWatchlistPrice(li.dataset.symbol, li);
    });
}, 60000);
