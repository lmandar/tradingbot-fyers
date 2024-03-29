const fyers = require("fyers-api-v2");
require('./../DB/dbConnection')
const Master = require('./../common_model/master-model')
const open = require('open');
const authService = require('./../fyersAPI/auth')
fyers.setAppId('5RCCSEFW7O-100')
fyers.setAccessToken('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE2NzQ5MTk2MDYsImV4cCI6MTY3NDk1MjI0NiwibmJmIjoxNjc0OTE5NjA2LCJhdWQiOlsieDowIiwieDoxIiwieDoyIiwiZDoxIiwiZDoyIiwieDoxIiwieDowIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCajFUNjJGN3o2bWFKclZYYXF3elN2bVFzd0MwLTg2cUlTWDc4cG9nckFTeWM1TmpMOVVSRXEzOFF0SDZqeDBUR2FYZ3V1VlZ0aUxBcHlBNzhZa0M1dXE2MU5SUThUamhFM2Fzam9XSTF1ejRHMmh6ND0iLCJkaXNwbGF5X25hbWUiOiJNQU5EQVIgQkhJS0FKSSBMT05FIiwib21zIjpudWxsLCJmeV9pZCI6IlhNMzEzNDMiLCJhcHBUeXBlIjoxMDAsInBvYV9mbGFnIjoiTiJ9.jY9_erwNR0QtGYedUztaW1mjL3x8rPMMTiTZ_pIyFuk')

let reqBody = {}

module.exports = {
    placeOrder,
    exitAllPosition,
    cancelOrder
}

async function placeOrder(reqData) {
    try {
        let master = await Master.findOne({ status: 1 })
        reqBody = {
            data: {
                "symbol": "NSE:PAYTM-EQ",
                "qty": reqData.qty,
                "type": 4,  /* 1 => Limit Order 2 => Market Order 3 => Stop Order (SL-M) 4 => Stoplimit Order (SL-L) */
                "side": -1,
                "productType": "BO", /* CNC => For equity only INTRADAY => Applicable for all segments. MARGIN => Applicable only for derivatives CO => Cover Order BO => Bracket Order */
                "limitPrice": reqData.limitPrice, /* Default => 0 Provide valid price for Limit and Stoplimit orders */
                "stopPrice": reqData.entry,
                "disclosedQty": 0,
                "validity": "DAY",
                "offlineOrder": "false",
                "stopLoss": reqData.stoploss,
                "takeProfit": reqData.take_profit
            },
            app_id: master.app_id,
            token: master.access_token

        }
        let place_order = await fyers.place_order(reqBody)
        console.log("place order", place_order)
        return place_order
    } catch (err) {
        console.log(err)
    }
}

async function exitAllPosition(reqData) {
    let reqBody = {
        data: {},
        app_id: reqData.app_id,
        token: reqData.access_token
    }
    const exitPosition = await fyers.exit_position(reqBody)
    console.log("exitPosition", exitPosition)
    return exitPosition
}

async function cancelOrder(reqData) {
    let reqBody = {
        data: { "id": reqData.order_id },
        app_id: reqData.app_id,
        token: reqData.access_token
    }
    let cancel_order = await fyers.cancel_order(reqBody)
    console.log("cancel order", cancel_order)
    return cancel_order
}
