// Your Cloudflare Worker URL
const backendURL = "https://black-tree-2e32.sriviadithi.workers.dev/?symbol=";

let chart = null;
let candleSeries = null;

// Fetch data from Worker
async function fetchData(symbol) {
    try {
        const response = await fetch(backendURL + symbol);
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("Backend returned non-array:", data);
            return [];
        }

        return data.map(c => ({
            time: c.time,             // UNIX timestamp (seconds)
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close
        }));

    } catch (err) {
        console.error("Fetch error:", err);
        return [];
    }
}

function createChartIfNeeded() {
    if (chart) return;

    const container = document.getElementById("chart-container");

    chart = LightweightCharts.createChart(container, {
        width: container.clientWidth,
        height: container.clientHeight,
        layout: {
            background: { color: "#0f172a" },
            textColor: "#ffffff"
        },
        grid: {
            vertLines: { color: "#1e293b" },
            horzLines: { color: "#1e293b" },
        }
    });

    candleSeries = chart.addCandlestickSeries({
        upColor: "#4ade80",
        downColor: "#f87171",
        borderUpColor: "#4ade80",
        borderDownColor: "#f87171",
        wickUpColor: "#4ade80",
        wickDownColor: "#f87171"
    });
}

async function loadChart(symbol) {
    createChartIfNeeded();

    const data = await fetchData(symbol);

    if (data.length === 0) {
        console.warn("No chart data returned");
        return;
    }

    candleSeries.setData(data);
}

function setupWatchlist() {
    document.getElementById("watchlist").addEventListener("click", e => {
        if (e.target.dataset.symbol) {
            loadChart(e.target.dataset.symbol);
        }
    });
}

function init() {
    setupWatchlist();
    loadChart("RELIANCE.NS"); // Default
}

init();
