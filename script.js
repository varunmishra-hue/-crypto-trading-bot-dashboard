// Fake auth using localStorage
function register() {
  let user = document.getElementById("username").value;
  let pass = document.getElementById("password").value;
  if(localStorage.getItem(user)) {
    alert("User already exists!");
  } else {
    localStorage.setItem(user, pass);
    alert("Account created! Please login.");
  }
}

function login() {
  let user = document.getElementById("username").value;
  let pass = document.getElementById("password").value;
  if(localStorage.getItem(user) === pass) {
    alert("Welcome " + user);
    document.getElementById("auth").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
  } else {
    alert("Invalid credentials");
  }
}

// Fetch OHLCV data from Binance and plot chart
async function fetchData() {
  let symbol = document.getElementById("symbol").value;
  let res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1w&limit=52`);
  let data = await res.json();

  let prices = data.map(d => parseFloat(d[4])); // close prices
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

// Portfolio calculation
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

// Simulated trading
function placeOrder() {
  let action = document.getElementById("tradeAction").value;
  document.getElementById("tradeResult").innerText = `✅ ${action} order executed (simulation).`;
}
