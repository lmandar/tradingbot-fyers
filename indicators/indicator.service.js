var BB = require('technicalindicators').BollingerBands
const fyers = require("fyers-api-v2")
const Master = require("../common_model/master-model")



module.exports = {
    bollingerBand,
    getHistory
}

async function bollingerBand(req, res) {
    var now = new Date();
    var millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 09, 15, 0, 0);
    var millsecEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 30, 0, 0);
    let start_time = Math.floor(millisTill10.getTime() / 1000)
    let end_time = Math.floor(millsecEnd.getTime() / 1000)
    let trade_candle = await getHistory(start_time, end_time)
    if (!trade_candle) {
        throw "Please check internet"
    }
    console.log("length", trade_candle.length)
    let close_price = []
    for (key in trade_candle) {
        let close = trade_candle[key].c
        close_price.push(close)
    }
    var period = 20
    var input = { period: period, values: close_price, stdDev: 1}
    let value = await BB.calculate(input)
    let upper_band = value[value.length-1].upper.toFixed(2)
    let lower_band = value[value.length-1].lower.toFixed(2)
    let todays_candle_data = trade_candle[trade_candle.length-1]
    if(todays_candle_data.o < lower_band && todays_candle_data.c > lower_band){
        console.log(`Buy at above${todays_candle_data.h}`);
    }else if(todays_candle_data.o > upper_band && todays_candle_data.c < upper_band){
        console.log(`Sell at below${todays_candle_data.l}`);
    }else{
        console.log("No trade for today");
    }

    res.json(value)
}

async function getHistory(start_time, end_time) {
    try {
        let master = await Master.findOne({ status: 1 })
        fyers.setAppId(master.app_id)
        fyers.setAccessToken(master.access_token)

        let history = new fyers.history()
        let sell_data = []

        let result = await history.setSymbol('NSE:PAYTM-EQ')
            .setResolution('1D')
            .setDateFormat(1)
            .setRangeFrom("2023-02-01")
            .setRangeTo("2023-03-04")
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
            console.log(sell_data)
            return sell_data
        } else {
            throw result.message
        }
    } catch (err) {
        console.log(err)
    }
}