

const express = require('express')
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


// path  /
app.get('/',(req,res)=>{
  /** here we redirect user to a unique room
   * if users direct open link so they create a unique room to video call
   * here uuidv4 generete unique string every time 
   */
   res.redirect(`/${uuidV4()}`)
})

/**if user clcik on link they redirect to blow path */
app.get('/:room',(req,res)=>{
  /**here we render our ejs file and send rendom 
   *  string  created by uuidv4 function  */
  res.render('room',{roomID:req.params.room})
})


// connect new user to socket 
io.on('connection',socket=>{
 /**this handel request from client side 
  *  clint send roomid and user id which connect */
  socket.on('join-room',(roomID,userID)=>{
    socket.join(roomID)// create socket room
    socket.to(roomID).emit('user-connected',userID); // send msg to room in which user connect
    
    // when user disconnect  send  userid to  "user-disconnect" on clint side
    socket.on('disconnect',()=>{
      socket.to(roomID).emit('user-disconnected',userID);
    })
  })

})




server.listen(port, () => {
  console.log(`Example app listening `)
})