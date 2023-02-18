const constants = require('../constants/info')
const config = constants.config
const Binance = require('node-binance-api-ext');
const binance = Binance({
  APIKEY: config.api_key,
  APISECRET: config.secrate_key,
});


async function time() {
  try {
    let time_stamp = await binance.useServerTime();
    // let balance = await binance.futures.balance()
    // let order = await binance.futures.stopMarketBuy(config.asset, 0.1, 8223);  //BUY', symbol, quantity, false, params, callback
  } catch (err) {
    console.log("ERROR",err)
  }
}

time()