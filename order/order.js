const crypto = require('crypto')
const axios = require('axios');
const { take_profit } = require('../interval_data');
const orderSchema = require("./order.model")
const fyers = require("fyers-api-v2")
require('./../DB/dbConnection')
const Masetr = require('./../common_model/master-model')


module.exports = {
    placeOrder,
    openOrder,
    fyers_order
} 

async function placeOrder(reqData) {
    try {
        let master = await Masetr.findOne({status:1})
        reqBody = {
            data: {
                "symbol": "NSE:PAYTM-EQ",
                "qty": 1,
                "type": 3,  /* 1 => Limit Order 2 => Market Order 3 => Stop Order (SL-M) 4 => Stoplimit Order (SL-L) */
                "side": -1,
                "productType": "BO", /* CNC => For equity only INTRADAY => Applicable for all segments. MARGIN => Applicable only for derivatives CO => Cover Order BO => Bracket Order */
                "limitPrice": 0, /* Default => 0 Provide valid price for Limit and Stoplimit orders */
                "stopPrice": reqData.entry,
                "disclosedQty": 0,
                "validity": "DAY",
                "offlineOrder": "false",
                "stopLoss": reqData.stoploss,
                "takeProfit": reqData.take_profit
            },
            app_id: config.app_id,
            token: config.token
        }
        console.log(reqData.data)
        fyers.setAccessToken(master.access_token)
        let order = await fyers.place_order(reqBody)
            console.log(order)
        
    } catch (err) {
        console.log("err", err)
    }
}


async function openOrder(reqData) {
    try {
        let endPoint = `/fapi/v1/openOrders`
        let parameters = `symbol=BNBUSDT&recvWindow=5000&timestamp=${Date.now() - 1000}`
        console.log("parameters", parameters)
        let signature = await crypto.createHmac('sha256', config['secrate_key']).update(parameters).digest('hex');
        let url = `${burl}${endPoint}?${parameters}&signature=${signature}`
        console.log("config", config.api_key)
        let response = await axios.get(url, { headers: { 'X-MBX-APIKEY': config.api_key } });
        console.log("abc", response.data.length)
        if (!response.data.length) {

        }
    } catch (err) {
        console.log("Error-->>", err)
    }
}


async function fyers_order() {

}