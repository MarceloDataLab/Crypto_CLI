const inquirer = require('inquirer');

// ----------- API engine ----------------- 
let marketData;
let coin = "SOL";
let interval = "DAILY";
let market = "USD";
let exchange = `${coin} ⟶ ${market}`;

const request = require('request');

function callApi(coin, interval, market) {
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

function pick(values, baseKey, mkt = market) {
  const plain = `${baseKey}`;
  const withMktA = `${baseKey}a. ${plain.split('. ')[1]} (${mkt})`; 
  const withMkt = `${plain} (${mkt})`;                              
  return values[withMktA] || values[withMkt] || values[plain] || '-';
}

function boxData(date, values) {
  const open  = pick(values, '1. open');
  const high  = pick(values, '2. high');
  const low   = pick(values, '3. low');
  const close = pick(values, '4. close');

  return (
    "║" + centerLine("", 14)   + "║" + centerLine(`Open:  ${open}`, 57)  + "║\n" +
    "║" + centerLine("", 14)   + "║" + centerLine(`High:  ${high}`, 57)  + "║\n" +
    "║" + centerLine(date,14)  + "║" + centerLine(`Low:   ${low}`, 57)   + "║\n" +
    "║" + centerLine("", 14)   + "║" + centerLine(`Close: ${close}`, 57) + "║\n" +
    "╠" + "=".repeat(14)       + "╬" + "=".repeat(57)                     + "║"
  );
}

function detectSeriesKey(interval) {
  const SERIES_KEY = {
    DAILY: 'Time Series (Digital Currency Daily)',
    WEEKLY: 'Time Series (Digital Currency Weekly)',
    MONTHLY: 'Time Series (Digital Currency Monthly)',
  };
  return SERIES_KEY[interval];
}

async function askParams(defaults = { coin: 'BTC', interval: 'DAILY', market: 'USD' }) {
  const answers = await inquirer.prompt([
    {
      name: 'coin',
      type: 'input',
      message: 'Moeda (ex.: BTC, SOL, ETH):',
      default: defaults.coin,
      filter: (s) => String(s || '').trim().toUpperCase(),
      validate: (s) => /^[A-Z0-9]{2,10}$/.test(s) || 'Use 2-10 letras (ex.: BTC, SOL)',
    },
    {
      name: 'interval',
      type: 'list',
      message: 'Intervalo:',
      choices: ['DAILY', 'WEEKLY', 'MONTHLY'],
      default: defaults.interval,
    },
    {
      name: 'market',
      type: 'input',
      message: 'Mercado (ex.: USD, EUR):',
      default: defaults.market,
      filter: (s) => String(s || '').trim().toUpperCase(),
      validate: (s) => /^[A-Z]{3,5}$/.test(s) || 'Use 3-5 letras (ex.: USD, EUR)',
    },
  ]);
  return answers;
}

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
    const ans = await askParams({ coin, interval, market });
    coin = ans.coin;
    interval = ans.interval;
    market = ans.market;
    exchange = `${coin} ⟶ ${market}`;
    marketData = await callApi(coin, interval, market);  
    const currencyName =  marketData["Meta Data"]["3. Digital Currency Name"];
    const lastRefresh = marketData["Meta Data"]["6. Last Refreshed"];
    const Serie = detectSeriesKey(interval);
    const timeSeries = marketData[Serie];
    console.log("")
    console.log("╔" + "=".repeat(72) + "╗");
    console.log("║" + centerLine(currencyName, 72) + "║");
    console.log("╠" + "=".repeat(72) + "╣");
    console.log("║" + centerLine(exchange, 24) + centerLine(interval, 24) + centerLine(lastRefresh, 24)+ "║" );
    console.log("╠" + "=".repeat(14) + "╦" + "=".repeat(57) + "╣");
    for (const date in timeSeries) {
      const values = timeSeries[date];
      console.log(boxData(date, values));
    }
    console.log("╚" + "=".repeat(14) + "╩" + "=".repeat(57) + "╝");
    console.log('Fonte: Alpha Vantage - Apenas prática/portfólio - Sem aconselhamento financeiro');
  } catch (err) {
    console.error("Erro:", err.message);
  }
}

main();

