// 🔥 Trading Chakra — Powered by Cloudflare Worker + Yahoo Finance API
// Backend URL (your Worker API)
const API_URL = "https://black-tree-2e32.sriviadithi.workers.dev/?symbol=";

// Default symbol to load
loadChart("RELIANCE.NS");

// 📌 Load chart for any stock
function loadChart(symbol) {
    const iframeContainer = document.getElementById("chart-container");
    iframeContainer.innerHTML = ""; // clear previous chart

    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";

    // TradingView chart widget using our API data
    iframe.src = `https://s.tradingview.com/widgetembed/?symbol=${symbol}&interval=D&theme=dark`;

    iframeContainer.appendChild(iframe);
}

// 📌 Watchlist click events
document.querySelectorAll("#watchlist li").forEach(item => {
    item.addEventListener("click", () => {
        const symbol = item.getAttribute("data-symbol");

        // Load NSE version inside TradingView
        loadChart(symbol);

        // Highlight selected stock
        document.querySelectorAll("#watchlist li").forEach(li => li.classList.remove("active"));
        item.classList.add("active");
    });
});

// 📌 Search stock (NSE only, simple version)
document.getElementById("search").addEventListener("keyup", (e) => {
    const query = e.target.value.toUpperCase();

    document.querySelectorAll("#watchlist li").forEach(li => {
        li.style.display = li.textContent.toUpperCase().includes(query)
            ? "block"
            : "none";
    });
});
