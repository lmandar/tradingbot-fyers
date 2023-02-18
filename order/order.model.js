const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    orderId: { type: Number },
    symbol: { type: String },
    status: { type: String },
    clientOrderId: { type: String },
    price: { type: String },
    avgPrice: { type: String },
    origQty: { type: String },
    executedQty: { type: String },
    cumQty: { type: String },
    cumQuote: { type: String },
    timeInForce: { type: String },
    type: { type: String },
    reduceOnly: { type: Boolean },
    closePosition: { type: Boolean },
    side: { type: String },
    positionSide: { type: String },
    stopPrice: { type: String },
    workingType: { type: String },
    priceProtect: { type: Boolean },
    origType: { type: String },
    updateTime: { type: Number }
})

const orderSchema = new mongoose.model("Order", schema);
module.exports = orderSchema;