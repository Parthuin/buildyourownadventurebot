var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var twilio = require('twilio');

var oConnections = {};

// Define the port to run on
app.set('port', process.env.PORT || parseInt(process.argv.pop()) || 5100);

// Define the Document Root path
var sPath = path.join(__dirname, '.');

app.use(express.static(sPath));
app.use(bodyParser.urlencoded({ extended: true }));

function fRun(req, res){
var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("yes") != -1){
    twiml.message("You somehow manage to run up it and escape the haunted house. You win.");
    oConnections[sFrom].fCurState=fRun;
  }else{
    twiml.message("You face him again and he kills you. You have lost.");
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

function fEncounter(req, res){
var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("run") != -1){
    twiml.message("You run wherever you can and realize you are trapped by a tall fence. Try and run up it?");
    oConnections[sFrom].fCurState=fRun;
  }else if(sAction.toLowerCase().search("fight") != -1){
    twiml.message("You try punching him in the face and he kills you. You have lost the game.");
  }else if(sAction.toLowerCase().search("reason") != -1){
    twiml.message("You try to reason with him and a man falls down to his knees explaining everything. He lets you leave.");
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

function fGoingThroughDoor(req, res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("yes") == -1){
 
    twiml.message("You decide to not open the chest and go back the way you came. Instead, chains come out of nowhere and"+
                 " tie themselves to your body. You are being forced through the door. Resist?");
  }
  else{
  twiml.message("You go through the door and find yourself face to face with a guy in a hockey mask with a chainsaw ready to tear"+
               " your body apart. Run, fight, or reason?");
  }
  oConnections[sFrom].fCurState = fEncounter;    
  
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

function fOpenChest(req, res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("yes") != -1){
    twiml.message("You open the chest and find $50 and a paper with 'open the door damnit' on it. Open the door?");
    oConnections[sFrom].fCurState=fGoingThroughDoor;
  }else{
    oConnections[sFrom].fCurState = fGoingThroughDoor;    
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

function fFlipSwitch(req, res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("yes") != -1){
    twiml.message("You flip the switch lighting the whole room. You notice a sign saying go through the other door. Go through it?");
    oConnections[sFrom].fCurState=fGoingThroughDoor;
  }else{
    twiml.message("You don't flip it but examine the body. You find a key and notice a chest. Open the chest?");
    oConnections[sFrom].fCurState = fOpenChest;
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

function fExamine(req, res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("examine") != -1){
    oConnections[sFrom].fCurState = fFlipSwitch;
    twiml.message("You find a switch. Flip it?");
  }
  else{
    twiml.message("You leave the room and go back to the doors. Right or Middle?");
    oConnections[sFrom].fCurState = fPickaDoor;    
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

function fWarning(req,res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("yes") != -1){
    twiml.message("You exit the cave after a few hours and live. You have won.");
  }
  else
  {
    twiml.message("You ignore the sign and a hidden door opens up and a Friday the 13th dude comes out of it and shoots you. You lost.");
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}
  
function fExplore(req, res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("yes") != -1){
    twiml.message("You find a switch and light the cave. You find a sign saying 'save yourself' and pointing to the exit. Heed its warning?");
    oConnections[sFrom].fCurState = fWarning;
  }
  else{  
    twiml.message("You sit there and wait for someone to get you. You fall asleep and wake up next to your body. You have died and lost.");
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

function fPickaDoor(req, res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("Left") != -1){
    twiml.message("There is nothing in the room. Examine further?");
    oConnections[sFrom].fCurState = fExamine;
  }else if(sAction.toLowerCase().search("Right") != -1){  
    twiml.message("You see a statue and a frankenstein machine. Turn the machine on?");
    oConnections[sFrom].fCurState=fFlipSwitch;
  }else if(sAction.toLowerCase().search("Middle") !=-1){
    twiml.message("You enter and see a body on a pile of blood.");
  oConnections[sFrom].fCurState=fExamine;
  }
  else
  {
    twiml.message("You turn and fall down a trap door into a cave. Explore?");
    oConnections[sFrom].fCurState = fExplore;
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

function fBeginning(req, res){
  var sFrom = req.body.From;
  var twiml = new twilio.twiml.MessagingResponse();
  twiml.message('Hello. Welcome to the haunted house. There are 3 doors. Left, Right, or Middle?');
  oConnections[sFrom].fCurState = fPickaDoor;
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());

}

//define a method for the twilio webhook
app.post('/sms', function(req, res) {
  var sFrom = req.body.From;
  if(!oConnections.hasOwnProperty(sFrom)){
    oConnections[sFrom] = {"fCurState":fBeginning};
  }
  oConnections[sFrom].fCurState(req, res);
});

// Listen for requests
var server = app.listen(app.get('port'), () =>{
  var port = server.address().port;
  console.log('Listening on localhost:' + port);
  console.log("Document Root is " + sPath);
});
