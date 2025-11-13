// Fetch NSE stock data from Yahoo Finance API
async function fetchStockData(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5y&interval=1d`;

  const response = await fetch(url);
  const data = await response.json();

  const result = data.chart.result[0];

  const timestamps = result.timestamp;
  const indicators = result.indicators.quote[0];

  const candles = timestamps.map((t, i) => ({
    time: t,
    open: indicators.open[i],
    high: indicators.high[i],
    low: indicators.low[i],
    close: indicators.close[i],
    volume: indicators.volume[i]
  }));

  return candles;
}

// Load chart using Lightweight Charts
async function loadChart(symbol) {
  document.getElementById("chart-container").innerHTML = "";

  const chart = LightweightCharts.createChart(document.getElementById("chart-container"), {
    layout: {
      background: { color: "#0f172a" },
      textColor: "white"
    },
    grid: {
      vertLines: { color: "#1e293b" },
      horzLines: { color: "#1e293b" }
    },
    width: document.getElementById("chart-container").clientWidth,
    height: document.getElementById("chart-container").clientHeight,
  });

  const candleSeries = chart.addCandlestickSeries({
    upColor: "#4ade80",
    downColor: "#f43f5e",
    borderUpColor: "#4ade80",
    borderDownColor: "#f43f5e",
    wickUpColor: "#4ade80",
    wickDownColor: "#f43f5e"
  });

  const volumeSeries = chart.addHistogramSeries({
    color: "#60a5fa",
    priceFormat: { type: "volume" },
    priceScaleId: "",
    scaleMargins: { top: 0.8, bottom: 0 }
  });

  const candles = await fetchStockData(symbol);

  candleSeries.setData(candles);
  
  volumeSeries.setData(
    candles.map(c => ({
      time: c.time,
      value: c.volume,
      color: c.close > c.open ? "#4ade80" : "#f43f5e"
    }))
  );
}

// Default stock
loadChart("RELIANCE.NS");

// Watchlist click
document.querySelectorAll("#watchlist li").forEach(item => {
  item.addEventListener("click", () => {
    const symbol = item.dataset.symbol;
    loadChart(symbol);
  });
});

// Search filter
document.getElementById("search").addEventListener("input", e => {
  const value = e.target.value.toUpperCase();
  document.querySelectorAll("#watchlist li").forEach(li => {
    li.style.display = li.textContent.toUpperCase().includes(value) ? "" : "none";
  });
});
