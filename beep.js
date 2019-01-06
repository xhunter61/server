var io = require('socket.io')({transports: ['websocket']});
var trainer= require('leaptrainer');
var leap = require('leapjs');


var controller= new leap.Controller({enableGestures: true});
var leaptrainer= new trainer.LeapTrainer.Controller({controller: controller});
leaptrainer.fromJSON('{"name":"THUM","pose":true,"data":[[{"x":0.3472222222222222,"y":0.03596715917222662,"z":0.045284078870748576,"stroke":1},{"x":0.3055555555555556,"y":0.031651100071559496,"z":0.03984998940625872,"stroke":1},{"x":-0.6527777777777778,"y":-0.06761825924378612,"z":-0.08513406827700727,"stroke":1}]]}');

leaptrainer.fromJSON('{"name":"SCHNIPPS","pose":false,"data":[[{"x":0.529921806112504,"y":0.042358566581163395,"z":0.2174595712526579,"stroke":1},{"x":0.11052943758789108,"y":0.01495091013249221,"z":0.11347621531927493,"stroke":1},{"x":-0.3088629309367218,"y":-0.012456746316178977,"z":0.00949285938589195,"stroke":1},{"x":-0.1996194244686184,"y":-0.09889580011992892,"z":-0.14917482128949064,"stroke":1},{"x":0.18141452203753278,"y":-0.025469820294349632,"z":0.04285495196575978,"stroke":1},{"x":0.4931759403913057,"y":0.039019976382897184,"z":0.20927697817344837,"stroke":1},{"x":0.07390621601473107,"y":0.009206470541661002,"z":0.10546113251149147,"stroke":1},{"x":-0.3453635083618435,"y":-0.020607035299575957,"z":0.0016452868495342998,"stroke":1},{"x":-0.22159188523738718,"y":-0.06823010590513731,"z":-0.1847724398128986,"stroke":1},{"x":0.15656802074810322,"y":-0.01338776034910473,"z":0.0187983816690106,"stroke":1},{"x":-0.4700781938874961,"y":0.1335113446460615,"z":-0.3845181160246799,"stroke":1}]]}');

leaptrainer.fromJSON('{"name":"tap","pose":false,"data":[[{"x":0.17377193056798668,"y":-0.1910334480342961,"z":0.4967922546814276,"stroke":1},{"x":0.11232298244191652,"y":0.21355613755118272,"z":-0.3312084446937986,"stroke":1},{"x":0.1141001268976376,"y":0.00781021124681297,"z":0.07347885466207582,"stroke":1},{"x":0.1005191668326666,"y":-0.009261131043872578,"z":0.10179027886774217,"stroke":1},{"x":0.04480011946124485,"y":0.19910848931434175,"z":-0.3519501191562582,"stroke":1},{"x":0.09599021843512817,"y":-0.2069389525614204,"z":0.4951474227278845,"stroke":1},{"x":0.010088146585988389,"y":0.1640769922751423,"z":-0.30115720194289514,"stroke":1},{"x":0.022359149469895145,"y":-0.017709059881159533,"z":0.0719849789762046,"stroke":1},{"x":0.012594866157087603,"y":-0.04878348064102275,"z":0.1326184736927306,"stroke":1},{"x":-0.061558307442041604,"y":0.16205114602812812,"z":-0.35353986715319496,"stroke":1},{"x":0.017209958082584464,"y":-0.22480133740590572,"z":0.5001515063809373,"stroke":1},{"x":-0.09250154543220424,"y":0.11139311059208021,"z":-0.27276438378124307,"stroke":1},{"x":-0.07208875002285159,"y":-0.0514470518200878,"z":0.07039594847712494,"stroke":1},{"x":-0.0747437157883043,"y":-0.09565062266796917,"z":0.16810879188032557,"stroke":1},{"x":-0.4028643462467353,"y":-0.012371002951953786,"z":-0.4998484936190627,"stroke":1}]]}');


var lastGesture;

io.attach(4567);

io.on('connection', function (socket) {
    console.log("A user is connected");

    socket.on('getInfo', function () {
		console.log("Client is requesting Info");
        io.emit('updateInfo', {gesture: lastGesture});
		console.log("Updated Info emit");
        console.log(lastGesture);
		
    });
    
    socket.on('disconnect', function(){
       console.log("A User has disconnected"); 
    });

    leaptrainer.on('SCHNIPPS',function(){
        console.log("Schnipps detected");
        io.emit("schnippsGesture");
    
    });
    
    leaptrainer.on('THUM', function(){
        console.log("THUMB recognized"); 
        thumbemit=true;
     });
    
    var thumbemit=false;
    
    controller.on('deviceFrame', function(frame){
    var pointables= frame.pointables;
    var hand = frame.hands[0];
    var fingercount;
    var count=0;
    for( var i=0;i<frame.pointables.length;i++){
        if(frame.hands.length==1){
            if(hand.fingers[i].extended){
                count+=1;
            }
        }
    }
    
    if(thumbemit){
        if(hand.fingers[0].direction[0]>0){
            var directvect= "right";
            io.emit("swipeGesture2", {direction: directvect} );
        }else{
            var directvect="left";
            io.emit("swipeGesture", {direction: directvect} );
        }
        
     console.log(directvect);
        thumbemit=false;
       // io.emit("swipeGesture", {direction: directvect} );
    }
        
    //console.log(count);
    if(readGesture && count==1){
        //console.log("ready to read gesture");
   for(var i=0; i<frame.gestures.length;i++){
       
    var gesture= frame.gestures[i];
    var gesturetype= gesture.type;
    switch(gesturetype){
        case "circle":
          if (gesture.state == "stop") {
          console.log('circle with duration:'+gesture.duration);
              lastGesture= "circle";
              
        }
        break;

      case "swipe":
        if (gesture.state == "stop") {
          console.log('swipe with speed: '+gesture.speed);
            lastGesture= "swipe";
            io.emit("swipeGesture");
        }
        break;

      case "screenTap":
        if (gesture.state == "stop") {
         console.log('screenTap');
            lastGesture= "screnTap";
        }
        break;

      case "keyTap":
        if (gesture.state == "stop") {
          console.log('keyTap');
            lastGesture= "keyTap";
            io.emit("keytapGesture");
        }
        break;

      }
       readGesture=false;
       setTimeout(function(){readGesture=true},100);
    }
    }else if(readGesture && count==2){
        //console.log("ready to read gesture");
   for(var i=0; i<frame.gestures.length;i++){
       
    var gesture= frame.gestures[i];
    var gesturetype= gesture.type;
    switch(gesturetype){
        case "circle":
          if (gesture.state == "stop") {
          console.log('circle2 with duration:'+gesture.duration);
              lastGesture= "circle";
              
        }
        break;

      case "swipe":
        if (gesture.state == "stop") {
          console.log('swipe2 with speed: '+gesture.speed);
            lastGesture= "swipe";
        }
        break;

      case "screenTap":
        if (gesture.state == "stop") {
         console.log('screenTap2');
            lastGesture= "screnTap";
            io.emit("screenTapGesture2");
            break;
        }
        break;

      case "keyTap":
        if (gesture.state == "stop") {
          console.log('keyTap2');
            lastGesture= "keyTap";
            io.emit("keytapGesture2");
        }
        break;

      }
       readGesture=false;
       setTimeout(function(){readGesture=true},100);
    }
    }
});
    

});



leaptrainer.on('tap', function(){
 console.log("tapped");   
});


controller.on('connect', function() {
  console.log("Successfully connected.");
});

controller.on('deviceStreaming', function() {
  console.log("A Leap device has been connected.");
});

controller.on('deviceStopped', function() {
  console.log("A Leap device has been disconnected.");
});

var readGesture=true;


controller.connect();
