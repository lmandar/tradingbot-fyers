const mongoose = require('mongoose');

const schemea = new mongoose.Schema({
    broker: { type: String },
    auth_code: { type: String , require : true },   
    access_token: { type: String, require : true },
    statu: { type: Number },
    secret_key: { type: String, require : true },
    app_id: { type: String, require : true },
    open_order : {type : Number}
})

const Master = new mongoose.model("Master", schemea);
module.exports = Master;