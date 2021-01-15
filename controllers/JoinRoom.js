const mongoose = require('mongoose');
const RoomID = require('../Model/RoomIDModel');

const fetchData = (RoomName) => {

    return RoomID.find({ 'Room': RoomName }).then((data) => {
        return data
    })

}
const joinRoom = async (RoomName) => {
    let RoomData = await fetchData(RoomName)
    return RoomData;
}


module.exports = joinRoom;