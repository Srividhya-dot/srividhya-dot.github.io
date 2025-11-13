const backendURL = "https://black-tree-2e32.sriviadithi.workers.dev/?symbol=";

let chart = null;
let candleSeries = null;

async function fetchData(symbol) {
    const url = backendURL + symbol;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data || data.length === 0) {
            console.error("No data received");
            return [];
        }

        return data.map(d => ({
            time: d.date,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));

    } catch (error) {
        console.error("Fetch error:", error);
        return [];
    }
}

function createChartIfNeeded() {
    if (chart) return;

    chart = LightweightCharts.createChart(
        document.getElementById("chart-container"),
        {
            layout: { background: { color: "#0f172a" }, textColor: "#fff" },
            grid: { vertLines: { color: "#1e293b" }, horzLines: { color: "#1e293b" } },
            width: window.innerWidth - 260,
            height: window.innerHeight - 20,
        }
    );

    candleSeries = chart.addCandlestickSeries();
}

async function loadChart(symbol) {
    createChartIfNeeded();

    const data = await fetchData(symbol);
    candleSeries.setData(data);
}

function setupWatchlist() {
    document.getElementById("watchlist").addEventListener("click", (e) => {
        if (e.target.dataset.symbol) {
            loadChart(e.target.dataset.symbol);
        }
    });
}

function init() {
    setupWatchlist();
    loadChart("RELIANCE.NS"); // default
}

init();
