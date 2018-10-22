var http = require('http'),
    https = require('https'),
    connect = require('connect'),
    httpProxy = require('http-proxy'),
    fileSystem = require('fs'),
    path = require('path');

var simpleSelectElemntCount = 0;
var selects = [];
var simpleselect = {};
var headSelect = {};

headSelect.query = 'footer';
headSelect.func = function(node) {
    var stm = node.createStream({ "outer" : true });
    var tag = '';
    stm.on('data', function(data) {
       tag += data;
    });
    stm.on('end', function() {
      stm.end(tag + '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/rythm.js/2.2.4/rythm.min.js"></script>' +
      '<script>var rythm = new Rythm();rythm.setMusic("http://localhost:8000/test.mp3");rythm.addRythm("shake3", "shake", 0, 10, { direction: "left", min: 5, max: 100 });rythm.addRythm("twist1", "twist", 0, 10);rythm.addRythm("twist3", "twist", 0, 10, { direction: "left" });setTimeout(function() {rythm.start();}, 5000);</script>');      
    });    
};

selects.push(headSelect);
var rhythmClasses = ['rythm-medium', 'rythm-high', 'rythm-bass'];
simpleselect.query = 'div[tooltip*=-]';
simpleselect.func = function (node) {
    var currentClass = node.getAttribute('class');
    var twist = ' shake3';
    if (currentClass.indexOf('successful') > -1) {
        simpleSelectElemntCount++;
        twist = ' twist1';
    }
    // node.setAttribute('class', currentClass + ' ' + rhythmClasses[Math.floor(Math.random()*rhythmClasses.length)] + ' twist3');
    node.setAttribute('class', currentClass + ' ' + rhythmClasses[Math.floor(Math.random()*rhythmClasses.length)] + twist);
}

selects.push(simpleselect);

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
        readStream.pipe(res);
      } else {
        proxy.web(req, res);
      }
  }
);

http.createServer(app).listen(8000);