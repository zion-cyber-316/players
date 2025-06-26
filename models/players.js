const mongoose = require("mongoose")
const Schema = mongoose.Schema;


let playerSchema = new Schema({
    playerName : String,
    matches : Number,
    runs : Number,
    image :{
        url:String,
        filename:String
    },
    hundred:Number,
    fifty :Number,
    six : Number,
    four :Number,
});

const  Players = mongoose.model("players",playerSchema);

module.exports = Players;