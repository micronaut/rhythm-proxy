var http = require('http'),
    https = require('https'),
    connect = require('connect'),
    httpProxy = require('http-proxy'),
    fileSystem = require('fs'),
    path = require('path');


var selects = [];
var simpleselect = {};
var headSelect = {};

headSelect.query = 'body';
headSelect.func = function(node) {
    var stm = node.createStream({ "outer" : true });

    var tag = '';

    //collect all the data in the stream
    stm.on('data', function(data) {
       tag += data;
    });

    //When the read side of the stream has ended..
    stm.on('end', function() {

      //Print out the tag you can also parse it or regex if you want
    //   process.stdout.write('tag:   ' + tag + '\n');
    //   process.stdout.write('end:   ' + node.name + '\n');
      
      //Now on the write side of the stream write some data using .end()
      //N.B. if end isn't called it will just hang.
      
      stm.end(tag + '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/rythm.js/2.2.4/rythm.min.js"></script>' +
      '<script>var rythm = new Rythm();rythm.setMusic("http://localhost:8000/test.mp3");rythm.addRythm("twist3", "twist", 0, 10, { direction: "left" });setTimeout(function() {rythm.start();}, 5000);</script>');      
    });    

};
selects.push(headSelect);
//<img id="logo" src="/images/logo.svg" alt="node.js">
var rhythmClasses = ['rythm-medium', 'rythm-high', 'rythm-bass'];
simpleselect.query = 'div[tooltip*=-]';

simpleselect.func = function (node) {
    // console.log(node)
    
    //Create a read/write stream wit the outer option 
    //so we get the full tag and we can replace it
    var currentClass = node.getAttribute('class');
    node.setAttribute('class', currentClass + ' ' + rhythmClasses[Math.floor(Math.random()*rhythmClasses.length)]);
    // var stm = node.createStream({ "outer" : true });

    // //variable to hold all the info from the data events
    // var tag = '';

    // //collect all the data in the stream
    // stm.on('data', function(data) {
    //    tag += data;
    // });

    // //When the read side of the stream has ended..
    // stm.on('end', function() {

    //   //Print out the tag you can also parse it or regex if you want
    // //   process.stdout.write('tag:   ' + tag + '\n');
    // //   process.stdout.write('end:   ' + node.name + '\n');
      
    //   //Now on the write side of the stream write some data using .end()
    //   //N.B. if end isn't called it will just hang.  
    //   stm.end('<img id="logo" src="http://i.imgur.com/LKShxfc.gif" alt="node.js">');      
    
    // });    
}

selects.push(simpleselect);

//
// Basic Connect App
//
var app = connect();

var proxy = httpProxy.createProxyServer({
   target: 'http://jenkins-as01.gale.web:8080',
   agent  : http.globalAgent, 
   headers:{ host: 'jenkins-as01.gale.web:8080',
   'Accept-Encoding': 'identity'},
   followRedirects: true
})


app.use(require('harmon')([], selects, true));

app.use(
  function (req, res) {
      if (req.url && req.url === '/test.mp3') {

        var filePath = path.join(__dirname, 'test.mp3');
        var stat = fileSystem.statSync(filePath);

        res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size
        });

        var readStream = fileSystem.createReadStream(filePath);
        // We replaced all the event handlers with a simple call to util.pump()
        readStream.pipe(res);
      } else {
        proxy.web(req, res);
      }
  }
);

http.createServer(app).listen(8000);