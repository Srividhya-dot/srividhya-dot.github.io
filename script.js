function loadChart(symbol) {
  document.getElementById("chart-container").innerHTML = "";

  new TradingView.widget({
    autosize: true,
    symbol: symbol,
    interval: "D",
    range: "5Y",
    timezone: "Asia/Kolkata",
    theme: "dark",
    style: "1",
    locale: "en",
    container_id: "chart-container"
  });
}

loadChart("RELIANCE.NS");  // default

document.querySelectorAll("#watchlist li").forEach(item => {
  item.addEventListener("click", () => {
    loadChart(item.dataset.symbol);
  });
});

document.getElementById("search").addEventListener("input", e => {
  let value = e.target.value.toUpperCase();
  document.querySelectorAll("#watchlist li").forEach(li => {
    li.style.display = li.textContent.toUpperCase().includes(value)
      ? ""
      : "none";
  });
});
