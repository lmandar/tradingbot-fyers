const mongoose = require('mongoose');
// let url = 'mongodb+srv://lmandar:Mandar%4019699@cluster0.7ojzev0.mongodb.net/trading_bot_fyers?retryWrites=true&w=majority'
let url = 'mongodb://lmandar:Mandar%4019699@ac-nerfwp1-shard-00-00.7ojzev0.mongodb.net:27017,ac-nerfwp1-shard-00-01.7ojzev0.mongodb.net:27017,ac-nerfwp1-shard-00-02.7ojzev0.mongodb.net:27017/trading_bot_fyers?ssl=true&replicaSet=atlas-7zfd7f-shard-0&authSource=admin&retryWrites=true&w=majority'

mongoose.set('strictQuery', false);

mongoose.connect(url,{
    useNewUrlParser:true,
    useUnifiedTopology : true
})
.then( () => console.log("connection sucessfully ....."))
.catch((err) => console.log(err))

