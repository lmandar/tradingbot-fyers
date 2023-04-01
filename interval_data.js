const { response } = require("express")
const fyers = require("fyers-api-v2")
const open = require('open');
const Master = require("./common_model/master-model")
let reqBody = {}

module.exports = {
    getHistory,
    genrateAuthcode
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
            .setRangeFrom(start_time)
            .setRangeTo(end_time)
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


async function genrateAuthcode(req, res) {
    try {
        let master = await Master.findOne({ status: 1 })

        fyers.setAppId(master.app_id)
        fyers.setRedirectUrl(master.redirect_url)
        let data = await fyers.generateAuthCode()
        master.url = data
        console.log(master)
        master.save()
        // await open(data, { app: 'chrome' });
    } catch (err) {
        console.log("Error", err)
    }
}

