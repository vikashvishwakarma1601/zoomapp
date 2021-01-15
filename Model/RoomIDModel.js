const mongoose = require('mongoose')

let RoomIDSchema = new mongoose.Schema({
    Room: {
        type: String,
        require:true,
        trim:true,
    }
},{collection:'RoomID'})

let RoomID = mongoose.model('RoomID', RoomIDSchema);

module.exports = RoomID;