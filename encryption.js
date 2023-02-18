const crypto = require('crypto');
const apiSecret = 'MeflfeX9AGSMlokKMVUfPKBFZu4URiXwnK3tp0Awl0NP1vH0UVyYfqOFMqPDEbVr';

module.exports={
    signature
}

function signature(query_string) {
    return crypto
        .createHmac('sha256', apiSecret)
        .update(query_string)
        .digest('hex');
}

console.log("hashing the string: ");
console.log(query_string);
console.log("and return:");
console.log(signature(query_string));

console.log("\n");

// const another_query = `symbol=BNBUSDT&side=SELL&type=STOP_MARKET&quantity=0.5&price=123&recvWindow=500&timestamp=${Date.now()}`;
// console.log("hashing the string: ");
// console.log(another_query);
// console.log("and return:");
// console.log(signature(another_query));