// ----------- API engine ----------------- 
let marketData;
let coin;
let interval = "MONTHLY";
let market;
let currencyName;
let lastRefresh;
let exchange = `${coin = "BTC"} ⟶ ${market = "USD"}`;

const request = require('request');

function callApi(coin = "BTC", interval = "MONTHLY", market = "USD") {
  const url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_${interval}&symbol=${coin}&market=${market}&apikey=URICEDTCKRGV4I3M`;
  return new Promise((resolve, reject) => {
    request.get({
      url: url,
      json: true,
      headers: { 'User-Agent': 'request' }
    }, (err, res, data) => {
      if (err) {
        reject(err); // ❌ erro de rede
      } else if (res.statusCode !== 200) {
        reject(new Error(`Status: ${res.statusCode}`)); // ❌ erro de HTTP
      } else if (data['Note']) {
        reject(new Error('Rate limit atingido pela API')); // ❌ aviso da API
      } else {
        resolve(data); // ✅ sucesso
      }
    });
  });
}

// ----------- Funçoes -----------------

function centerLine(text, totalWidth = 74) {
  const padding = Math.max(0, totalWidth - text.length);
  const left = Math.floor(padding / 2);
  const right = totalWidth - text.length - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
};

// ----------- UI ----------------- 

console.log(`
\x1b[32m
 ██████ ██████  ██    ██ ██████  ████████  ██████       ██████ ██      ██ 
██      ██   ██  ██  ██  ██   ██    ██    ██    ██     ██      ██      ██ 
██      ██████    ████   ██████     ██    ██    ██     ██      ██      ██ 
██      ██   ██    ██    ██         ██    ██    ██     ██      ██      ██ 
 ██████ ██   ██    ██    ██         ██     ██████       ██████ ███████ ██ 
\x1b[0m                                                                         
`);

console.log(centerLine('Crypto CLI — dados de criptomoedas em tempo real no teu terminal'));
console.log(centerLine('by MarceloDataLab'));
console.log(centerLine('Source: Alpha Vantage — https://www.alphavantage.co'));

async function main() {
  try {
    marketData = await callApi();  
    currencyName =  marketData["Meta Data"]["3. Digital Currency Name"];
    lastRefresh = marketData["Meta Data"]["6. Last Refreshed"];
    console.log("")
    console.log("╔" + "=".repeat(72) + "╗");
    console.log("║" + centerLine(currencyName, 72) + "║");
    console.log("╠" + "=".repeat(72) + "╣");
    console.log("║" + centerLine(exchange, 24) + centerLine(interval, 24) + centerLine(lastRefresh, 24)+ "║" );
     console.log("╠" + "=".repeat(72) + "╣");
  } catch (err) {
    console.error("Erro:", err.message);
  }
}

main();

