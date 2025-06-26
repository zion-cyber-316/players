const mongoose = require("mongoose");
const initDb = require("./data");
const Players = require("../models/players.js");


let mongoose_url = "mongodb://127.0.0.1:27017/players-stats";




main().then(()=>{
    console.log("connecting to DB")
}).catch(()=>{
    console.log("error")
})
async function  main(){
    await mongoose.connect(mongoose_url);
}


const initData = async()=>{
    await Players.deleteMany({});
    await Players.insertMany(initDb.data)

    console.log("data was delete");

}

initData();