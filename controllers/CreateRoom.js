const mongoose = require('mongoose');
const RoomID = require('../Model/RoomIDModel');

const fetchData = (RoomName) => {

    return RoomID.find({ 'Room': RoomName }).then((data) => {
        return data
    })

}
// const joinRoom = async (RoomName) => {
//     console.log("RoomData : Join Room",RoomName)
//     let RoomData = await fetchData(RoomName)
//     console.log("RoomData : ", RoomData)
//     return RoomData;
// }

const saveData = async (RoomName) => {
    let newRoom = new RoomID({ Room: RoomName });
    console.log("RoomData : Create Room ")
    return await newRoom.save().then((data) => {
        return data;
    })
}

const createRoom = async (RoomName) => {
    console.log("RoomData : Create Room ")
    let RoomData = await fetchData(RoomName)
    if (RoomData[0]) {
        return false;
    }
    let newRoomData = await saveData(RoomName)
    return newRoomData;
}

// module.exports = joinRoom;
module.exports = createRoom; 