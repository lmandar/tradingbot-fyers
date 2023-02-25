const mongoose = require('mongoose');
let url = 'mongodb+srv://lmandar:Mandar%4019699@cluster0.7ojzev0.mongodb.net/trading_bot_fyers?retryWrites=true&w=majority' 
mongoose.connect(url,{
    useNewUrlParser:true,
    useUnifiedTopology : true
})
.then( () => console.log("connection sucessfully ....."))
.catch((err) => console.log(err))