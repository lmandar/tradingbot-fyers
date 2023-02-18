const { response } = require("express")
const fyers = require("fyers-api-v2")
const open = require('open');
const Master = require("./common_model/master-model")
let reqBody = {}

module.exports = {
    getHistory,
    genrateAuthcode
}

async function getHistory(start_time,end_time) {
    try {
        let master = await Master.findOne({ status: 1 })
        fyers.setAppId(master.app_id)
        fyers.setAccessToken(master.access_token)

        let history = new fyers.history()
        let sell_data = []

        let result = await history.setSymbol('NSE:PAYTM-EQ')
            .setResolution('5')
            .setDateFormat(0)
            .setRangeFrom('1675414800')
            .setRangeTo('1675438200')
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
                if (a.o > a.c) {
                    sell_data.push(a)
                    break;
                }
            }
            return sell_data[0]
        } else if (result.code == '-8') {
            console.log("result", result)
            await genrateAuthcode()
        } else {
            throw result.message
        }
        console.log(sell_data)
    } catch (err) {
        console.log(err)
    }
}


async function genrateAuthcode(req,res) {
    try {
        console.log("inside authcode")
        fyers.setAppId('5RCCSEFW7O-100')
        fyers.setRedirectUrl('http://localhost:3000/callback')
        let data = await fyers.generateAuthCode()
        await open(data, { app: 'chrome' });
    } catch (err) {
        console.log("Error", err)
    }   
}

