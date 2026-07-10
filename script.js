let trades = [];
let alertPrice = 0;

// Simple login simulation
function login() {
  let user = document.getElementById("username").value;
  alert("Welcome " + user + "! You are now logged in.");
}

// Fetch weekly chart data (public Binance API)
async function fetchData() {
  let symbol = document.getElementById("symbol").value;
  let res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1w&limit=52`);
  let data = await res.json();

  let prices = data.map(d => parseFloat(d[4]));
  let labels = data.map((d,i) => "Week " + (i+1));

  document.getElementById("price").innerText = `Latest Price: ${prices[prices.length-1]} USDT`;

  let ctx = document.getElementById("chart").getContext("2d");
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `${symbol} Close Price`,
        data: prices,
        borderColor: 'gold',
        backgroundColor: 'rgba(255,215,0,0.2)',
        fill: true
      }]
    }
  });
}

// Portfolio tracker (public Binance API)
async function calcPortfolio() {
  let btc = parseFloat(document.getElementById("btc").value) || 0;
  let eth = parseFloat(document.getElementById("eth").value) || 0;
  let bnb = parseFloat(document.getElementById("bnb").value) || 0;

  let btcPrice = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT`).then(r=>r.json());
  let ethPrice = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT`).then(r=>r.json());
  let bnbPrice = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT`).then(r=>r.json());

  let total = btc*btcPrice.price + eth*ethPrice.price + bnb*bnbPrice.price;
  document.getElementById("portfolio").innerText = `Total Value: ${total.toFixed(2)} USDT`;
}

// Deposit INR simulation
function depositINR() {
  let amount = parseFloat(document.getElementById("deposit").value);
  let method = document.getElementById("payment").value;
  if(amount > 0) {
    document.getElementById("depositResult").innerText = `✅ Payment of ₹${amount} via ${method} successful. Wallet credited.`;
    trades.push({symbol:"INR", side:"DEPOSIT", amount, price:1, status:"Order Confirmed"});
    updateTradeTable();
  }
}

// Price alert
function setAlert() {
  alertPrice = parseFloat(document.getElementById("alertPrice").value);
  document.getElementById("alertResult").innerText = `Alert set at ${alertPrice} USDT`;
}

// --- 🔐 Backend Integration (real trading) ---
const BACKEND_URL = "http://127.0.0.1:5000"; // change to your deployed backend URL

// Fetch price from backend (uses your API key in Flask)
async function fetchPrice(symbol) {
  let res = await fetch(`${BACKEND_URL}/price?symbol=${symbol}`);
  let data = await res.json();
  document.getElementById("price").innerText = `Latest Price: ${data.price} USDT`;
}

// Place order via backend (real trade)
async function placeOrder() {
  let action = document.getElementById("tradeAction").value;
  let symbol = document.getElementById("symbol").value;
  let amount = 0.01; // example amount

  if(action === "None") return;

  let res = await fetch(`${BACKEND_URL}/order`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({symbol, side: action, amount})
  });

  let data = await res.json();
  trades.push({symbol, side:action, amount, price:data.info?.price || "N/A", status:"Order Confirmed"});
  updateTradeTable();
}

// Transaction history table
function updateTradeTable() {
  let table = document.getElementById("tradeTable");
  table.innerHTML = "<tr><th>Symbol</th><th>Side</th><th>Amount</th><th>Price</th><th>Status</th></tr>";
  trades.forEach(t => {
    table.innerHTML += `<tr><td>${t.symbol}</td><td>${t.side}</td><td>${t.amount}</td><td>${t.price}</td><td>${t.status}</td></tr>`;
  });
}
