const express = require("express");
const cron = require("node-cron");
require('./DB/dbConnection')
const Master = require('./common_model/master-model')
const orderService = require('./fyersAPI/order')
const fyers = require("fyers-api-v2");
const interval_data_service = require('./interval_data')
const indicatorService = require('./indicators/indicator.service')
var BB = require('technicalindicators').BollingerBands
const auth_service = require('./fyersAPI/auth')
const PORT = 3000
app = express();
app.get('/callback', auth)
app.get('/get-url', getURL)
app.post('/auth-code', interval_data_service.genrateAuthcode)
app.post('/access-token', auth_service.accessToken)
app.post('/bollinger-band', indicatorService.bollingerBand)
app.post('/on-off', auth_service.onOFF)
app.post('/get-history', indicatorService.getHistory)


module.exports = {
    // startDataLogic,
    auth
}

// async function startDataLogic() {
//     try {
//         let master = await Master.findOne({ status: 1 })
//         let end_date = new Date();
//         let start_date = new Date();
//         start_date.setDate(start_date.getDate() - 3);
//         let start_time = Math.floor(start_date.getTime() / 1000)
//         let end_time = Math.floor(end_date.getTime() / 1000)
//         let trade_candle = await interval_data_service.getHistory(start_time, end_time)
//         if (!trade_candle) {
//             throw "Please check internet"
//         }
//         console.log("length", trade_candle.length)
//         let close_price = []
//         for (key in trade_candle) {
//             let close = trade_candle[key].c
//             close_price.push(close)
//         }
//         console.log(close_price)

//         let value = await indicatorService.ema(close_price)
//         console.log("value",value[value.length - 1])
//         // var period = 20
//         // var input = { period: period, values: close_price, stdDev: 1 }
//         // let value = await BB.calculate(input)
//         // let upper_band = value[value.length - 66].upper.toFixed(2)
//         // /* let lower_band = value[value.length-1].lower.toFixed(2) */
//         // let todays_candle_data = trade_candle[trade_candle.length - 66]

//         /* Bollinger band logic start */

//         // if (todays_candle_data.o > upper_band && todays_candle_data.c < upper_band && master.open_order == 0) {
//         //     console.log(`Sell at below ${todays_candle_data.l}`);
//         //     let entry = Number(todays_candle_data.l)
//         //     let high = Number(todays_candle_data.h)
//         //     let stoploss = (high - entry).toFixed(2)
//         //     let take_profit = (stoploss * 2).toFixed(2)
//         //     let qty = (30 / (high - entry).toFixed(0))
//         //     let limitPrice = Number(entry - 0.05)
//         //     let parameters = { "entry": entry, "stoploss": stoploss, "take_profit": take_profit, "qty": qty, "limitPrice":limitPrice }
//         //     /* Formula Intraday/Daily Chg = (Price - Prev Day's Close) / Prev Day's Close * 100 */
//         //     let percentage = ((todays_candle_data.l - todays_candle_data.h) / todays_candle_data.o * 100).toFixed(2)
//         //     if (percentage < -1.50) {
//         //         parameters.stoploss = 5
//         //         parameters.take_profit = 10
//         //         parameters.qty = 10
//         //     }
//         //     console.log("[percentage]", percentage)
//         //     console.log("[parameters]", parameters)

//         //     let order = await orderService.placeOrder(parameters) // place order
//         //     if (order.s == 'ok') {
//         //         master.open_order = 1
//         //         master.order_id = order.id
//         //         let update = await master.save()
//         //         console.log("update open order here", update.open_order, "and order id", update.order_id)
//         //     }
//         // } else if (todays_candle_data.o < upper_band && todays_candle_data.c > upper_band && master.open_order == 1) {
//         //     let cancel_order = await orderService.cancelOrder(master)
//         //     if (cancel_order.s == 'ok') {
//         //         master.open_order = 0
//         //         await master.save()
//         //     }
//         // } else {
//         //     console.log(`No trade for this candle ${JSON.stringify(todays_candle_data)}`);
//         // }

//         /* Bollinger band logic ends */


//     } catch (err) {
//         console.log("Error", err)
//     }
// }

async function auth(req, res) {
    try {
        console.log("inside auth")
        let auth_code = req.query.auth_code
        let master = await Master.findOne({ "broker": "fyers" })
        console.log(master)
        master.auth_code = auth_code
        fyers.setAppId(master.app_id)
        reqBody = {
            "auth_code": auth_code,
            "secret_key": master.secret_key
        }
        let access_token = await fyers.generate_access_token(reqBody)
        console.log("access_token", access_token)
        if (access_token.s != 'ok') {
            console.log("access token not genrated")
            throw "access token not genrated"
        }
        master.access_token = access_token.access_token
        await master.save()
    } catch (err) {
        console.log(err)
    }
    res.send("Hello world")
}

async function getURL(req, res) {
    try {
        let master = await Master.findOne({ status: 1 })
        if (master == null) {
            res.status(500).json({ status_code: 0, message: "masterbank not configured" })
        }
        console.log("master", master);
        res.send({ url: master.url })
    } catch (err) {
        console.log(err)
    }
}

// cron.schedule("*/1 * * * *", async function () {
//     let master = await Master.findOne({ "broker": "fyers" })
//     let date = new Date().toISOString();
//     console.log("inside scheduler every 5 min", date)
//     if (master.status == 1) {
//         startDataLogic();
//     }
// });

// cron.schedule("16 9 * * *", async function () {
//     let master = await Master.findOne({ "broker": "fyers" })
//     // fyers.setAppId(master.app_id)
//     // fyers.setAccessToken(master.access_token)
//     // let market_status = await fyers.market_status()
//     // console.log("market_status",market_status)

//     let date = new Date().toISOString();
//     console.log("inside scheduler daily 9 AM", date)
//     if (master != null) {
//         master.open_order = 0
//         master.status = 1
//         await master.save()
//     }
// });

// cron.schedule("10 3 * * *", async function () {
//     let master = await Master.findOne({ "broker": "fyers" })
//     let date = new Date().toISOString();
//     console.log("inside scheduler  daily 3:10 pm", date)
//     if (master != null) {
//         let exit_all_position = await orderService.exitAllPosition(master)
//         console.log(exit_all_position)
//     }
//     master.status = 0
//     await master.save()
// });

app.listen(PORT, () => {
    console.log("application listening.....");
});
