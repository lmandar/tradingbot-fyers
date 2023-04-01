var BB = require('technicalindicators').BollingerBands
const EMA = require('technicalindicators').EMA
const fyers = require("fyers-api-v2")
const orderService = require('../fyersAPI/order')


module.exports = {
    bollingerBand,
    getHistory,
    ema
}

async function bollingerBand(req, res) {
    try{
    var now = new Date();
    let master = await Master.findOne({status : 1})
    var millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 09, 15, 0, 0);
    var millsecEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 30, 0, 0);
    let start_time = Math.floor(millisTill10.getTime() / 1000)
    let end_time = Math.floor(millsecEnd.getTime() / 1000)
    let trade_candle = await getHistory(start_time, end_time)
    
    if (!trade_candle) {
        throw "Please check internet"
    }
    console.log(trade_candle)
    console.log("length", trade_candle.length)
    let close_price = []
    for (key in trade_candle) {
        let close = trade_candle[key].c
        close_price.push(close)
    }
    var period = 20
    var input = { period: period, values: close_price, stdDev: 1}
    let value = await BB.calculate(input)
    console.log(value)
    let upper_band = value[value.length-1].upper.toFixed(2)
    // let lower_band = value[value.length-1].lower.toFixed(2)
    let todays_candle_data = trade_candle[trade_candle.length-1]
    if(todays_candle_data.o > upper_band && todays_candle_data.c < upper_band){
        console.log(`Sell at below ${todays_candle_data.l}`);
        // return todays_candle_data
        let entry = todays_candle_data.l
        let high = todays_candle_data.h
        let stoploss = Number((high - entry).toFixed(2))
        let take_profit = stoploss * 2
        let qty = 50 /(high-entry).toFixed(0)
        let parameters = { "entry": entry, "stoploss": stoploss, "take_profit": take_profit, "qty" : qty }
        //Formula Intraday/Daily Chg = (Price - Prev Day's Close) / Prev Day's Close * 100 
        let percentage = ((todays_candle_data.l - todays_candle_data.h) / todays_candle_data.o * 100).toFixed(2)
        if(percentage < -1.50){
            parameters.stoploss = 5
            parameters.take_profit = 10
            parameters.qty = 10
        }
        console.log("[percentage]",percentage) 
        console.log("[parameters]",parameters)

        let order = await orderService.placeOrder(parameters) // place order
        if (order.s == 'ok') {
            open_order = 1
            master.open_order = open_order
            let update = await master.save()
            console.log("update open order here", update.open_order)
        }
    }else{
        console.log(`No trade for this candle ${todays_candle_data}`);
    }

    res.json({status:"OK"})
} catch (err) {
    console.log("Error", err)
}
}

async function getHistory(start_time, end_time) {
    try {
        let master = await Master.findOne({ status: 1 })
        fyers.setAppId(master.app_id)
        fyers.setAccessToken(master.access_token)

        let history = new fyers.history()
        let sell_data = []

        let result = await history.setSymbol('NSE:PAYTM-EQ')
            .setResolution('5')
            .setDateFormat(0)
            .setRangeFrom('1679024700')
            .setRangeTo('1679025000')
            .getHistory()
        if (result.s == 'ok') {
            for (key in result.candles) {
                let data = result.candles[key]
                let a = {
                    openT: data[0],
                    o: data[1],
                    h: data[2],
                    l: data[3],
                    c: data[4]
                }
                sell_data.push(a)
            }
            // console.log(sell_data)
            console.log("length", sell_data.length)
            return sell_data
        } else {
            throw result.message
        }
    } catch (err) {
        console.log(err)
    }
}

async function ema(reqData){
    let period = 5;
    let values = reqData;                    
    let ema = EMA.calculate({period : period, values : values})
    console.log("ema",ema)
    return ema  
}