let trades = [];
let alertPrice = 0;

function login() {
  let user = document.getElementById("username").value;
  alert("Welcome " + user + "! You are now logged in.");
}

// Fetch market data with timeframe and dark chart styling
async function fetchData() {
  let symbol = document.getElementById("symbol").value;
  let timeframe = document.getElementById("timeframe").value;

  let intervalMap = {
    "1h": "1h",
    "1d": "1d",
    "1w": "1w",
    "1M": "1M",
    "1y": "1w"
  };
  let interval = intervalMap[timeframe];
  let limit = timeframe === "1y" ? 52 : 100;

  let res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  let data = await res.json();

  let prices = data.map(d => parseFloat(d[4]));
  let labels = data.map((d,i) => `${timeframe} ${i+1}`);

  document.getElementById("price").innerText = `Latest Price: ${prices[prices.length-1]} USDT`;

  let ctx = document.getElementById("chart").getContext("2d");
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `${symbol} Close Price (${timeframe})`,
        data: prices,
        borderColor: '#000000',              // black line
        backgroundColor: 'rgba(0,0,0,0.3)',  // semi-transparent black fill
        fill: true
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: '#FFFFFF' }
        },
        tooltip: {
          backgroundColor: '#333333',
          titleColor: '#FFD700',
          bodyColor: '#00FFCC'
        }
      },
      scales: {
        x: {
          ticks: { color: '#FFFFFF' },
          grid: { color: '#444444' }
        },
        y: {
          ticks: { color: '#FFFFFF' },
          grid: { color: '#444444' }
        }
      }
    }
  });
}

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

function depositINR() {
  let amount = parseFloat(document.getElementById("deposit").value);
  let method = document.getElementById("payment").value;
  let user = document.getElementById("username").value || "Guest";
  if(amount > 0) {
    document.getElementById("depositResult").innerText = `✅ Payment of ₹${amount} via ${method} successful. Wallet credited.`;
    trades.push({name:user, symbol:"INR", side:"DEPOSIT", amount, price:1, status:"Order Confirmed"});
    updateTradeTable();
  }
}

function setAlert() {
  alertPrice = parseFloat(document.getElementById("alertPrice").value);
  document.getElementById("alertResult").innerText = `Alert set at ${alertPrice} USDT`;
}

async function placeOrder() {
  let action = document.getElementById("tradeAction").value;
  let symbol = document.getElementById("symbol").value;
  let user = document.getElementById("username").value || "Guest";
  if(action === "None") return;

  let priceData = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`).then(r=>r.json());
  let price = priceData.price;
  trades.push({name:user, symbol, side:action, amount:1, price, status:"Order Confirmed"});
  updateTradeTable();
}

function updateTradeTable() {
  let table = document.getElementById("tradeTable");
  table.innerHTML = "<tr><th>Name</th><th>Symbol</th><th>Side</th><th>Amount</th><th>Price</th><th>Status</th></tr>";
  trades.forEach(t => {
    table.innerHTML += `<tr><td>${t.name}</td><td>${t.symbol}</td><td>${t.side}</td><td>${t.amount}</td><td>${t.price}</td><td>${t.status}</td></tr>`;
  });
}
