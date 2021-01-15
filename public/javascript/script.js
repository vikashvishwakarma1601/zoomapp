const socket = io('/')
const Peer = require('simple-peer')
const videoGrid = document.querySelector('#video-grid');
const selfVideo = document.querySelector('.self');
const myVideo = document.createElement('video');
const myDiv = document.createElement('div');
const preview = document.createElement('video');
const resize = document.createElement('i');
const recBtn = document.createElement('i');
const downloadBtn = document.createElement('i');
let recordingTimeMS = 5000;
let resizeStatus = false;
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: 8080
})

let peerUsers = {};
let messageBox;
let connectedUsers;
let myVideoStream;
let currentUser;
let mediaRecorder;
let recordedBlobs;

let flag = false;
let recordingStatus = false;
let enableDownload = false;
let streamType = "UserMedia";

const UserMedia = () => {
    return navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    })
}

const DisplayMedia = () => {
    return navigator.mediaDevices.getDisplayMedia({
        video: {
            mediaSource: 'window' || 'screen'
        },
        audio: true,
    })
}

const SwitchScreen = () => {
    if (streamType == 'UserMedia') {
        StopMediaStream();
        UserDisplayMediaStream();
        document.querySelector('#screenSharing').innerHTML = 'Stop Sharing';

    }
    else {
        document.querySelector('#screenSharing').innerHTML = 'Share Screen';
        StopMediaStream();
        UserMediaStream();
    }
}

const UserMediaStream = () => {
    streamType = "UserMedia";

    UserMedia().then((stream) => {
        myVideoStream = stream;
        addVideoStream(myDiv, myVideo, stream, true, resize, recBtn, downloadBtn);
        window.stream = stream;

        peer.on('call', call => {
            call.answer(stream)

            const video = document.createElement('video');
            const div = document.createElement('div');
            call.on('stream', userVideoStream => {
                addVideoStream(myDiv, myVideo, stream, true);
            })
        })

        socket.on('user-connected', (userID, UserName, RoomUsers) => {
            connecToNewUser(userID, stream, UserName);
            currentUser = userID;
            connectedUsers = [...RoomUsers];
        })
    })
}

const UserDisplayMediaStream = () => {
    document.querySelector('.fa-desktop').classList.add('active');
    streamType = "UserDisplay";

    DisplayMedia().then((stream) => {
        myVideoStream = stream;
        addVideoStream(myDiv, myVideo, stream, true, resize, recBtn, downloadBtn);
        window.stream = stream;

        peer.on('call', call => {
            call.answer(stream)

            const video = document.createElement('video');
            const div = document.createElement('div');
            call.on('stream', userVideoStream => {
                addVideoStream(div, video, userVideoStream, false)
            })
        })

        socket.on('user-connected', (userID, UserName, RoomUsers) => {
            connecToNewUser(userID, stream, UserName);
            currentUser = userID;
            connectedUsers = [...RoomUsers];
        })
    });
}


const StopMediaStream = () => {
    document.querySelector('.fa-desktop').classList.remove('active');
    myVideoStream.getTracks()
        .forEach(track => track.stop())
}

let text = $('input')

$('html').keydown((event) => {
    if (event.which == 13 && text.val().length != 0) {
        socket.emit('message', text.val(), UserName);
        text.val('');
    }
})

socket.on('createMessage', (message, UserName, Messages) => {
    $('.messages').append(`<li class="message"><span>${UserName}</span>: ${message}<li>`)
    messageBox = [...Messages];
    scrollToBottom()
})

socket.on('user-disconnect', (userID) => {
    if (peerUsers[userID]) {
        peerUsers[userID].close();
    }
})



peer.on('open', id => {
    socket.emit('join-room', RoomID, id, UserName);
})

const connecToNewUser = (userID, stream) => {
    const call = peer.call(userID, stream);
    const div = document.createElement('div');
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
        addVideoStream(div, video, userVideoStream, false)
    })
}

const disconnectToUser = () => {
    const call = peer.call(currentUser, myVideoStream);
    call.on('close', () => {
        video.remove();
    })
    peerUsers[currentUser] = call;

    window.location.href = "http://127.0.0.1:8080/";
}

const addVideoStream = (div, video, stream, userVideo, resize, recBtn, downloadBtn) => {
    video.srcObject = stream;
    div.setAttribute('class', 'frame');

    if (userVideo) {
        video.id = "myVideoStream";
        resize.setAttribute('class', 'fas fa-expand');
        resize.onclick = resizeVideo;
        recBtn.setAttribute('class', 'fas fa-circle');
        downloadBtn.setAttribute('class', 'fas fa-download');
        recBtn.id = 'recBtn';
        recBtn.onclick = recorder;
        div.append(resize)
        div.append(recBtn)
        div.append(downloadBtn)
    }
    else {
        const resize = document.createElement('i');

        resize.setAttribute('class', 'fas fa-expand');
        resize.onclick = resizeVideo;

        div.append(resize)
    }

    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    div.appendChild(video)
    videoGrid.append(div);

}

const scrollToBottom = () => {
    let d = $('.main_chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}


const stopPlay = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        StopMediaStream();
        setPlayVideo();
    } else {
        setStopVideo();
        UserMediaStream();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setUnmuteButton = () => {
    const render = `<i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>`

    document.querySelector('.main_mute_button').innerHTML = render;
}

const setMuteButton = () => {
    const render = `<i class="mute fas fa-microphone"></i>
    <span>Mute</span>`

    document.querySelector('.main_mute_button').innerHTML = render;
}

const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.avatar').style.display = 'none';
    document.querySelector('.main_video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class="active fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.avatar').style.display = 'flex';
    document.querySelector('.main_video_button').innerHTML = html;
}


const showParticipants = () => {

    $('.header').text('Participants');
    $('.participants').css('display', 'block');
    $('.messages').css('display', 'none');
    $('.main_message_container').css('display', 'none');
    $('.participants').empty();

    if (connectedUsers) {
        connectedUsers.forEach((user) => {
            $('.participants').append(`<li class="user">${user[0]}</li>`);
        })
    }
}


const showChatWindow = () => {

    $('.header').text('Chats');
    $('.participants').css('display', 'none');
    $('.messages').css('display', 'block');
    $('.main_message_container').css('display', 'flex');
    $('.messages').empty();

    if (messageBox) {
        messageBox.forEach((msg) => {
            $('.messages').append(`<li class="message"><span>${msg[0]}</span> : ${msg[1]}<li>`);
        })
    }

}



const recorder = () => {
    if (recordingStatus) {
        recBtn.classList.add('fas', 'fa-circle');
        recBtn.classList.remove('fa-pause');
        recordingStatus = false;
        stopRecording();
    }
    else {
        recordingStatus = true;
        enableDownload = true;
        recBtn.classList.remove('fa-circle');
        recBtn.classList.add('fas', 'fa-pause');
        if (enableDownload) {
            $('.fa-download').css('display', 'flex');
        }
        startRecording();


        let downloadButton = document.querySelector('.fa-download');
        downloadButton.addEventListener('click', () => {
            const blob = new Blob(recordedBlobs, { type: 'video/mp4' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'test.mp4';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        });
    }
}



const startRecording = () => {
    recordedBlobs = [];
    let options = { mimeType: 'video/webm;codecs=vp9,opus' };
    try {
        mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e) {
        return;
    }

    mediaRecorder.onstop = (event) => {
        console.log('Recorder stopped: ', event);
        console.log('Recorded Blobs: ', recordedBlobs);
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();

}

const stopRecording = () => {
    mediaRecorder.stop();
}


const handleDataAvailable = (event) => {
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
}

const resizeVideo = () => {
    let parentNode = event.target.parentNode;
    let resizeNode = event.target.parentNode.childNodes[3];
    let allVideoNodes = [...document.getElementsByClassName('frame')];
    if (!resizeStatus) {
        resizeStatus = true;
        allVideoNodes.forEach((videoFrame) => {
            videoFrame.style.display = 'none'
        });
        parentNode.style.display = 'flex';
        parentNode.style.width = '100vh';
        parentNode.style.height = '100%';
        resizeNode.style.width = '100%';
        resizeNode.style.height = '100%';
    }
    else {
        resizeStatus = false;
        allVideoNodes.forEach((videoFrame) => {
            videoFrame.style.display = 'flex'
        });
        parentNode.style.width = '300px';
        parentNode.style.height = '250px';
        resizeNode.style.width = '100%';
        resizeNode.style.height = '100%';
    }
}