const express = require("express");
const cron = require("node-cron");
require('./DB/dbConnection')
const Masetr = require('./common_model/master-model')
const orderService = require('./fyersAPI/order')
const fyers = require("fyers-api-v2");
const interval_data_service = require('./interval_data')
const indicatorService = require('./indicators/indicator.service')
const auth_service = require('./fyersAPI/auth')
const PORT = process.env.PORT || 3000
app = express();
app.get('/callback', auth)
app.get('/get-url',getURL)
app.post('/auth-code', interval_data_service.genrateAuthcode)
app.post('/access-token', auth_service.accessToken)
app.post('/bollinger-band', indicatorService.bollingerBand)
app.post('/on-off', auth_service.onOFF)


module.exports = {
    startDataLogic,
    auth
}

async function startDataLogic() {
    try {
        var now = new Date();
        var millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 09, 15, 0, 0);
        var millsecEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 30, 0, 0);
        let start_time = Math.floor (millisTill10.getTime() / 1000) 
        let end_time = Math.floor (millsecEnd.getTime() / 1000) 
        let master = await Masetr.findOne({status : 1})
        let trade_candle = await interval_data_service.getHistory(start_time,end_time)
        if (!trade_candle) {
            throw "Please check internet"
        }

        let entry = trade_candle.l
        let high = trade_candle.h
        let stoploss = Number((high - entry).toFixed(2))
        let take_profit = stoploss * 2
        let qty = 50 /(high-entry).toFixed()
        let parameters = { "entry": entry, "stoploss": stoploss, "take_profit": take_profit, "qty" : qty }
        //Formula Intraday/Daily Chg = (Price - Prev Day's Close) / Prev Day's Close * 100 
        let percentage = ((trade_candle.l - trade_candle.h) / trade_candle.o * 100).toFixed(2)
        if(percentage < -1.50){
            parameters.stoploss = 5
            parameters.take_profit = 10
            parameters.qty = 10
        }
        console.log("[percentage]",percentage) 
        console.log("[parameters]",parameters)
        
        let order = await orderService.placeOrder(parameters) // place order
        if (order.id) {
            open_order = 1
            master.open_order = open_order
            let update = await master.save()
            console.log("update open order here", update.open_order)
        }
    } catch (err) {
        console.log("Error", err)
    }
}

async function auth(req, res) {
    try {
        console.log("inside auth")
        let auth_code = req.query.auth_code
        let master = await Masetr.findOne({status : 1})
        master.auth_code = auth_code
        fyers.setAppId(master.app_id)
        reqBody = {
                "auth_code": auth_code,
                "secret_key": master.secret_key
            }
        let access_token = await fyers.generate_access_token(reqBody)
        console.log("access_token",access_token)
        if(access_token.s != 'ok'){
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

async function getURL(req,res){
    try{
    let master = await Masetr.findOne({status : 1})
    if(master == null){
        res.status(500).json({status_code : 0, message: "masterbank not configured"}) 
    }
    console.log("master",master);
    res.send({url : master.url})
}catch(err){
    console.log(err)
}
}

cron.schedule("*/5 * * * *", async function () {
    let master = await Masetr.findOne({status : 1})
    let date = new Date().toISOString();
    console.log("inside scheduler every 5 min", date)
    if (master.open_order == 0 && master.status == 1) {
        startDataLogic();
    }
});

cron.schedule("0 9 * * *", async function () {
    let master = await Masetr.findOne({status : 1})
    // fyers.setAppId(master.app_id)
    // fyers.setAccessToken(master.access_token)
    // let market_status = await fyers.market_status()
    // console.log("market_status",market_status)

    let date = new Date().toISOString();
    console.log("inside scheduler daily 9 AM", date)
    if (master != null) {
        master.open_order == 0
        await master.save() 
    }
});

cron.schedule("10 3 * * *", async function () {
    let master = await Masetr.findOne({status : 1})
    let date = new Date().toISOString();
    console.log("inside scheduler  daily 3:10 pm", date)
    if (master != null) {
        let exit_all_position = await orderService.exitAllPosition(master) 
        console.log(exit_all_position)
    }
});

app.listen(PORT, () => {
    console.log("application listening.....");
});