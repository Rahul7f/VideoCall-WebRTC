

const express = require('express');
const { unwatchFile } = require('fs');
const app = express()
const server = require('http').Server(app);
const io = require("socket.io")(server)

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

// universal unique identifiyer  always delare like this
const{v4: uuidV4} = require('uuid') 
//set ejs
app.set('view engine','ejs') 
// set public folder to acess clint side code like js, css,html
app.use(express.static('public')) 


var rooms_available = [];
var rooms_joinCount = {};


// path  /

app.get('/random',(req,res)=>{
  /** here we redirect user to random room if available
   * else he will be sent to one of the available room
   */
  if(rooms_available.length < 1)
  {
    var t = uuidV4();
    rooms_available.push(t);
    rooms_joinCount[t] = 0;
    res.redirect(`/${t}`);
  }
  else 
  {
    var t = rooms_available[0];
    res.redirect(`/${t}`);
  }
})


app.get('/',(req,res)=>{
  /** here we redirect user to a unique room
   * if users direct open link so they create a unique room to video call
   * here uuidv4 generete unique string every time 
   */
  //  res.redirect(`/${uuidV4()}`)
  res.sendFile(__dirname+"/index.html")
})

// browser automatically sends GET for favicon.ico . It handles the same
app.get('/favicon.ico',(req,res)=>{
  //do nothing
});

/**if user clcik on link they redirect to blow path */
app.get('/:room',(req,res)=>{
  /**here we render our ejs file and send rendom 
   *  string  created by uuidv4 function  */
    var t = req.params.room;
   if(rooms_joinCount[t] >= 0)
   {
     rooms_joinCount[t] += 1;
     if(rooms_joinCount[t] >= 2)
     {
       const ind = rooms_available.indexOf(t);
       if(ind > -1)
       {
         rooms_available.splice(ind,1);
       }
     }
     console.log("available room : ");
     console.log( rooms_available);
     console.log("room join count: ");
     console.log( rooms_joinCount);
   }
  res.render('room',{roomID:req.params.room})
})


// connect new user to socket 
io.on('connection',socket=>{
 /**this handel request from client side 
  *  clint send roomid and user id which connect */
    data = socket.id
    socket.emit('initName', data);
    


 // to handle disconnection from server
 socket.on('connected-socket',(roomID)=>{
  socket.join(roomID);
  socket.on('disconnect',function () {
      if(rooms_joinCount[roomID] >= 0)
      {
        rooms_joinCount[roomID] -= 1;
        if (rooms_joinCount[roomID] <= 1 && rooms_available.indexOf(roomID) == -1) {
          rooms_available.push(roomID);
        }
        console.log(rooms_available);
        console.log(rooms_joinCount);
      }
    });
 });

  socket.on('join-room',(roomID,userID)=>{
    socket.join(roomID)// create socket room
    socket.to(roomID).emit('user-connected',userID);
    // send msg to room in which user connect
    
    // when user disconnect  send  userid to  "user-disconnect" on clint side
    socket.on('disconnect',()=>{
      socket.to(roomID).emit('user-disconnected',userID);
    });
  });
});

setInterval(()=>{
  if(rooms_available.length > 1)
  {
    console.log("Switch request Sent");
    io.sockets.to(rooms_available[1]).emit('switch-room',rooms_available[0]);
    rooms_available.splice(1,1);
    console.log(rooms_available);
    console.log(rooms_joinCount);
  }
},2000);

server.listen(port, () => {
  console.log(`Example app listening `)
});

