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
            z-index: 999995;
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
            display: none !important;
        }
        
        @-webkit-keyframes move {
            from {
            left: -30%;
            }
            to {
            left: 100%;
            }
        }   

        .scary {
            z-index: 999999;
            position: absolute;
            top: 0;
            height: 100%;
            width: 100%;
        }

        .scary-image { 
            width: 100%;
        }

        .diwali, .thanksgiving{
            padding-top: 10%;
            height: 100%;
            width: 100%;
            z-index: 999999999;
            background: transparent;
            position: absolute;
            top: 0;
            display: grid;
            grid-template-columns: 25% 50% 25%;
            justify-items: center;
        }

        .firework1 {
            height: 400px;
            width: 400px;
            background: url(http://localhost:8000/firework1.gif);
            background-repeat: no-repeat;
            background-size: 100% 100%;
        }

        .firework2 {
            height: 300px;
            width: 300px;
            background: url(http://localhost:8000/firework2.gif);
            background-repeat: no-repeat;
            background-size: 100% 100%;
        }

        .diwali .happy {
            height: 300px;
            width: 600px;
            background: url(http://localhost:8000/diwali.gif);
            background-repeat: no-repeat;
            background-size: 100% 100%;
        }

        .thanksgiving .happy {
            height: 300px;
            width: 600px;
            background: url(http://localhost:8000/thanksgiving.gif);
            background-repeat: no-repeat;
            background-size: 100% 100%;
        }
    </style>
    <div class="diwali hidden">
        <div class="firework1"></div>
        <div class="happy"></div>
        <div class="firework2"></div>
    </div>
    <div class="thanksgiving hidden">
        <div class="turkey"></div>
        <div class="happy"></div>
        <div class="pilgrim"></div>
    </div>
    <div class="container hidden">
	    <div class="loader">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
    </div>
    <style>
        .container{
            top:0px;
            width:100%;
            height:100%;
            position:absolute;
            left:0%;
            z-index: 999999;
        }

        .loader {
            text-align: center;
        }
        .loader span {
            display: inline-block;
            width: 80px;
            height: 80px;
            margin: -280px 40px 54px  -34px;
            background-size: 100% 100%;
            -webkit-animation: loader 10s infinite  linear;
            -moz-animation: loader 10s infinite  linear;
        }

        .leaf {
            background:url("http://premiumcoding.com/CSSTricks/fallingLeaves/leaf.png");
        }

        .snowflake {
            background:url("http://localhost:8000/snowflake.png");
        }

        .snowflake {
            background:url("http://localhost:8000/snowflake.png");
        }

        .loader span:nth-child(5n+5) {

            -webkit-animation-delay: 1.3s;
            -moz-animation-delay: 1.3s;
        }
        .loader span:nth-child(3n+2) {

            -webkit-animation-delay: 1.5s;
            -moz-animation-delay: 1.5s;
        }
        .loader span:nth-child(2n+5) {

            -webkit-animation-delay: 1.7s;
            -moz-animation-delay: 1.7s;
        }

        .loader span:nth-child(3n+10) {

            -webkit-animation-delay: 2.7s;
            -moz-animation-delay: 2.7s;
        }
        .loader span:nth-child(7n+2) {

            -webkit-animation-delay: 3.5s;
            -moz-animation-delay: 3.5s;
        }
        .loader span:nth-child(4n+5) {

            -webkit-animation-delay: 5.5s;
            -moz-animation-delay: 5.5s;
        }
        .loader span:nth-child(3n+7) {

            -webkit-animation-delay: 8s;
            -moz-animation-delay: 8s;
        }
        @-webkit-keyframes loader {
        0% {
            width: 80px;
            height: 80px;
            opacity: 1;

            -webkit-transform: translate(0, 0px) rotateZ(0deg);
        }
        75% {
            width: 80px;
            height: 80px;
            opacity: 1;

            -webkit-transform: translate(100px, 600px) rotateZ(270deg); 
        }
        100% {
            width: 80px;
            height: 80px;
            opacity: 0;

            -webkit-transform: translate(150px, 800px) rotateZ(360deg);
        }
        }
        @-moz-keyframes loader {
        0% {
            width: 80px;
            height: 80px;
            opacity: 1;
            
            -webkit-transform: translate(0, 0px) rotateZ(0deg);
        }
        75% {
            width: 80px;
            height: 80px;
            opacity: 1;
        
            -webkit-transform: translate(100px, 600px) rotateZ(270deg); 
        }
        100% {
            width: 80px;
            height: 80px;
            opacity: 0;
            
            -webkit-transform: translate(150px, 800px) rotateZ(360deg);
        }
        }   
    </style> 
   
      
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/rythm.js/2.2.4/rythm.min.js"></script>
    <script>
        var rythm = new Rythm();
        let songs = ['jiggy-with-it.mp3', 'celebration.mp3', 'I-Feel-Good.mp3', 'Another-One-Bites-The-Dust.mp3'];
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
    node.setAttribute('class', currentClass + ' ' + rhythmClasses[Math.floor(Math.random()*rhythmClasses.length)] + twist);
}

selects.push(simpleselect);

var dashboardSelect = {};
dashboardSelect.query = '.dashboard';
dashboardSelect.func = function (node) {
    var currentClass = node.getAttribute('class');

    node.setAttribute('class', currentClass + ' ' + 'shake3');
}

selects.push(dashboardSelect);

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
      } else if (req.url && req.url.indexOf('snowflake.png') > -1) {
        var filePath = path.join(__dirname, req.url);
        var stat = fileSystem.statSync(filePath);
        res.writeHead(200, {
            'Content-Type': 'png',
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
console.log('Server listening on port 8000');
