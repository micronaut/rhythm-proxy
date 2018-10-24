var http = require('http'),
    https = require('https'),
    connect = require('connect'),
    httpProxy = require('http-proxy'),
    fileSystem = require('fs'),
    path = require('path');
      




let clientScript = `
    <style>
        body {
            overflow-x: hidden;
        }

        .creepy {
            position: absolute;
            left: -30%;
            bottom: 0;
            animation: move 8s linear 8s;
            width: 300px;
            z-index: 999999;
            -webkit-transform: scaleX(-1);
            transform: scaleX(-1);
        }

        .ghost {
            animation: move 12s linear 12s;
            animation-direction: reverse;
            -webkit-transform: scaleX(1);
              transform: scaleX(1);
            bottom: 50%;
        }

        .witch {
            animation: move 3s linear 3s;
            -webkit-transform: scaleX(1);
            transform: scaleX(1);
            top: 10%;
        }

        .hidden {
            display: none;
        }
        
        @-webkit-keyframes move {
            from {
            left: -30%;
            }
            to {
            left: 100%;
            }
        }   
    </style>
    <div class="creepy zombie hidden">
        <img src="http://localhost:8000/zombie.gif" />
    </div>
    <div class="creepy witch hidden">
        <img src="http://localhost:8000/witch.gif" />
    </div>
    <div class="creepy ghost hidden">
        <img src="http://localhost:8000/ghost.gif" />
    </div>
    <script>
        function showMonster() {
           let monsters = ['.zombie', '.witch', '.ghost']; 
           let timing = [5000, 7500, 10000, 3000]; 
           document.querySelector(monsters[Math.floor(Math.random()*monsters.length)]).classList.remove('hidden');
           setTimeout(showMonster, timing[Math.floor(Math.random()*timing.length)]);
        }
        setTimeout(showMonster, 5000);
    </script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/rythm.js/2.2.4/rythm.min.js"></script>
    <script>
        var rythm = new Rythm();
        let songs = ['jiggy-with-it.mp3', 'celebration.mp3', 'jiggy-with-it.mp3', 'stayin-alive.mp3', 'gonna-make-you-sweat.mp3', 'jiggy-with-it.mp3'];
        let song = songs[Math.floor(Math.random()*songs.length)];
        rythm.setMusic("http://localhost:8000/" + song);
        rythm.addRythm("shake3", "shake", 0, 10, { direction: "left", min: 5, max: 100 });
        rythm.addRythm("twist1", "twist", 0, 10);
        rythm.addRythm("twist3", "twist", 0, 10, { direction: "left" });
        
        let shouldPlay = localStorage.getItem('shouldPlay') || 'false';
        if (shouldPlay === 'true' && document.querySelectorAll('div.job').length === document.querySelectorAll('div.successful').length) {
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
      if (req.url && req.url.indexOf('.mp3') > -1) {
        var filePath = path.join(__dirname, req.url);
        var stat = fileSystem.statSync(filePath);
        res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size
        });
        var readStream = fileSystem.createReadStream(filePath);
        readStream.pipe(res);
      } else if (req.url && req.url.indexOf('.gif') > -1) {
        var filePath = path.join(__dirname, req.url);
        var stat = fileSystem.statSync(filePath);
        res.writeHead(200, {
            'Content-Type': 'gif',
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
