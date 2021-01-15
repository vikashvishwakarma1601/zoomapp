
const handleChange = () => {
    if (event.target.value === 'Join Room') {
        setButtonValue('Join Room');
    }
    else {
        setButtonValue('Create Room')
    }
}

const setButtonValue = (value) => {
    const buttonValue = `<input type="submit" class="btn disabled" value="${value}" disabled>`
    document.querySelector('.button').innerHTML = buttonValue;
}


let roomID;
const handleInput = () => {
    roomID = event.target.value
    userName = event.target.value
    if (roomID.length != 0 && userName.length != 0) {
        document.querySelector('.btn').classList.remove('disabled');
        document.querySelector('.btn').removeAttribute('disabled');
    }
    else {
        console.log("Invalid ID")
    }
}



