let http = require('http'),
    connect = require('connect'),
    httpProxy = require('http-proxy'),
    fs = require('fs'),
    path = require('path');
let {jenkinsHost, proxyPort, soundFileTypes, soundFileDir} = require('./config');

let clientScript = `
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/rythm.js/2.2.4/rythm.min.js"></script>
    <script>
        var rythm = new Rythm();
        let songs = new Array(${fs.readdirSync(`${__dirname}/${soundFileDir}`).filter(file => soundFileTypes.includes(path.extname(file))).map(file => `'${file}'`)});
        let song = songs[Math.floor(Math.random() * songs.length)];
        rythm.setMusic("http://localhost:${proxyPort}/${soundFileDir}/" + song);
        rythm.addRythm("shake3", "shake", 0, 10, { direction: "left", min: 5, max: 100 });
        rythm.addRythm("twist1", "twist", 0, 10);
        rythm.addRythm("twist3", "twist", 0, 10, { direction: "left" });
        
        let shouldPlay = localStorage.getItem('shouldPlay') || 'false';
        if (${process.env.NODE_ENV === 'dev'} || (shouldPlay === 'true' && document.querySelectorAll('div.job').length === document.querySelectorAll('div.successful').length)) {
            localStorage.setItem('shouldPlay', 'false');
            setTimeout(function() {
                rythm.start();
            }, 5000);
        } else if (document.querySelectorAll('div.job').length === document.querySelectorAll('div.successful').length) {
            localStorage.setItem('shouldPlay', 'false');
        } else {
	        localStorage.setItem('shouldPlay', 'true');
	    }
    </script>
`;
var selects = [];
var simpleselect = {};
var headSelect = {};
var culpritSelect = {};

headSelect.query = 'footer';
headSelect.func = function(node) {
    var stm = node.createStream({ "outer" : true });
    var tag = '';
    stm.on('data', function(data) {
       tag += data;
    });
    stm.on('end', function() {
      stm.end(tag + clientScript);      
    });    
};

selects.push(headSelect);
var rhythmClasses = ['rythm-medium', 'rythm-high', 'rythm-bass'];
simpleselect.query = 'div[tooltip*=-]';
simpleselect.func = function (node) {
    var currentClass = node.getAttribute('class');
    var twist = ' shake3';
    if (currentClass.indexOf('successful') > -1) {
        twist = ' twist3';
    } 
    node.setAttribute('class', currentClass + ' ' + rhythmClasses[Math.floor(Math.random()*rhythmClasses.length)] + twist);
}

selects.push(simpleselect);

culpritSelect.query = 'div[tooltip*=-] p';
culpritSelect.func = function (node) {

	//Create a read/write stream wit the outer option 
    //so we get the full tag and we can replace it
    var stm = node.createStream({ "outer" : true });

    //variable to hold all the info from the data events
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

      let images = '';

        if (tag.indexOf('Possible culprit:') > -1) {
            var culpritExtractPattern = /Possible culprit:\s*(.+)</gi;
            var match = culpritExtractPattern.exec(tag);
            match[1].split(', ').forEach(culprit => {
                if (fs.existsSync(`images/${culprit}.jpg`)) {
                    images += `<img src="http://localhost:${proxyPort}/images/${culprit}.jpg" height="30%" style="border-radius: 20px; margin: 5px;"/>`
                } else {
                    images += `<img src="http://localhost:${proxyPort}/images/unknown.jpg" height="30%" style="border-radius: 20px; margin: 5px;"/>`
                }
            });
        };
      
      //Now on the write side of the stream write some data using .end()
      //N.B. if end isn't called it will just hang.  
      stm.end(tag + images);      
    
    });    
}

selects.push(culpritSelect);

var app = connect();
var proxy = httpProxy.createProxyServer({
   target: `http://${jenkinsHost}`,
   agent  : http.globalAgent, 
   headers:{ host: `${jenkinsHost}`,
   'Accept-Encoding': 'identity'},
   followRedirects: true
})

app.use(require('harmon')([], selects, true));

app.use(
  function (req, res) {
      if (req.url && req.url.indexOf('.mp3') > -1) {
        var filePath = path.join(__dirname, req.url);
        var stat = fs.statSync(filePath);
        res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size
        });
        var readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
      } else if (req.url && req.url.indexOf('.jpg') > -1) {
            var filePath = path.join(__dirname, req.url);
            var stat = fs.statSync(filePath);
            res.writeHead(200, {
                'Content-Type': 'image/jpeg',
                'Content-Length': stat.size
            });
            var readStream = fs.createReadStream(filePath);
            readStream.pipe(res);
      } else {
        proxy.web(req, res);
      }
  }
);

http.createServer(app).listen(`${proxyPort}`);
console.log(`Server listening on port ${proxyPort}`);
