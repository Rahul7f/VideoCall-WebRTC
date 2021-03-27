
// call io form server js
const socket = io('/')

/**peerJS simplifies peer to peer data, video, and audio call by webrtc 
 * connecting to the server from client peerJS
*/

const myPeer = new Peer(undefined, {
    secure: true,
    host: '/',
    port: '443'
})
// object for all connected users
const peers = {}

// get div which have id "video-grid" in this we  going to create video objects
const videoGrid = document.getElementById('video-grid')

// create video object for "video-grid" div
const myvideo = document.createElement('video')

// we don't  want to hear our voice on video call  mute for self
myvideo.muted = true

socket.on('connect',()=>{
    socket.emit('connected-socket',ROOM_ID);
});

socket.on('switch-room',(roomID)=>{
    console.log("Switch request received");
    ROOM_ID = roomID;
    window.location.href = "/"+roomID;
});

const listener = (eventName, ...args) => {
    console.log(eventName, args);
  }
socket.onAny(listener);

// this code is generally for get user video and audio js code 
// it return promice that resolve to media stream object
navigator.mediaDevices.getUserMedia({
    video: true, //
    audio: true
}).then(stream => { // promice here we get user video and audio
     
    // pass myvideo(an video element ) stream (clint video and audio)
    addVideoStream(myvideo, stream) 
   
   
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })
   
    // when user connect
    socket.on("user-connected", userID => {
        connetToNewUser(userID, stream)
    })
})
// on open will be launch when you sucessfully connect to
// it create unique id when user connect
myPeer.on('open', id => {
    // send socket which contain room id and user id to server
    socket.emit('join-room', ROOM_ID, id)
})

// this handel request on server server send  userid  of connected user
socket.on('user-connected', userID => {
    // print a message on clint consol
    console.log('user connected ' + userID);
})

// this handel  disconect request  from server
// server provide userID of user which is disconnect
socket.on('user-disconnected', userID => {
    // if statement check user exit or not 
    //if exit   remove user from peers
    if (peers[userID]) {
        // remove freez video form div
        peers[userID].close()
    }
})

// this function conenct new user to peer
// it take userid  and user stream
function connetToNewUser(userID, stream) {
    //call 
    const call = myPeer.call(userID, stream)
    // video element
    const video = document.createElement('video')
    // call return  video stream of connected user

    call.on('stream', userVideoStream => {
        // pass user video to add on other user side
        addVideoStream(video, userVideoStream)
    })
    // when user disconnect call
    call.on('close', () => {
        video.remove()
    })
    // add all connected user to peers 
    peers[userID] = call
}

// this function add our video object  to "video-grid" div 
// and play video in video object
function addVideoStream(video, stream) {

    /**the srcOnject property of the HTMLMediaElement
     * interface set or return the object which serves as the
     * source of the media associated with HTMLMediaElement
     * the object can be a mediaSource or mediaStream
     */
    video.srcObject = stream 

    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    // videoGreid is a div here we append video in this div
    videoGrid.append(video)
}