const express = require("express");
require('./../DB/dbConnection')
app = express();
const fyers = require("fyers-api-v2");
const Masetr = require('./../common_model/master-model')


module.exports = {
    accessToken,
    onOFF
}

async function accessToken(req, res) {
    try {
        let auth_code = req.headers.auth_code
        let master = await Masetr.findOne({ status: 1 })
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
        // await master.save()
        return { access_token: access_token.access_token }
    } catch (err) {
        console.log(err)
    }
}

async function onOFF(req,res) {
    console.log(req.headers)
    let master = await Masetr.findOne({ broker: "fyers" })
    console.log("master", master.status)
    let message
    if (req.headers.status == 1) {
        master.status = 1
        message = "Application Started successfully."          
    } else if (req.headers.status == 0) {
        master.status = 0
        message = "Application Stoped successfully."
    }
    let data = await master.save()
    res.json({status : data.status, message:message})
}

