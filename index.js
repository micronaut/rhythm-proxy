let http = require('http'),
    connect = require('connect'),
    httpProxy = require('http-proxy'),
    fs = require('fs'),
    path = require('path');
let jobStatusCache = require('./clientScript')
let {jenkinsHost, proxyPort, soundFileTypes, soundFileDir} = require('./config');

let clientScript = `
    <style>
        .flip-card {
            background-color: transparent;
            width: 300px;
            height: 200px;
            border: 1px solid #f1f1f1;
            perspective: 1000px; /* Remove this if you don't want the 3D effect */
        }
        
        .flip-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.8s;
            transform-style: preserve-3d;
        }
        
        .flip-card.flip .flip-card-inner {
            transform: rotateX(180deg);
        }

        .flip-card.flip .img-cont {
            display: none;
        }
        
        .flip-card-front, .flip-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
        }
        
        .flip-card-back {
            color: white;
            transform: rotateX(180deg);
        }

        .flip-card-back img {
            height: 90%;
        }
    </style>
    <style>
        .inlineP {
            display: inline-block;
        }

        .img-cont {
            position: absolute;
            height: 65%;
            right: 20px;
            bottom: 0;
            display: flex;
            align-items: center;
        }

        .flip-card-back img.guilty {
            margin: 0 20px;
		height: 65%;
        }
    </style>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/rythm.js/2.2.4/rythm.min.js"></script>
    <script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>
    <script src="http://localhost:${proxyPort}/clientScript.js"></script>
    <script>
        $.noConflict();
        jQuery(document).ready(function() {
            wrapImages();
            updateJobStatusCache(${proxyPort});
            let songs = new Array(${fs.readdirSync(`${__dirname}/${soundFileDir}`).filter(file => soundFileTypes.includes(path.extname(file))).map(file => `'${file}'`)});
            doRadiatorDanceIfItsTime({proxyPort: ${proxyPort}, soundFileDir: '${soundFileDir}', songs, devEnv: ${process.env.NODE_ENV === 'dev'}});
        });
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
    if (tag.indexOf('Claiming for') > -1) {
        let culpritExtractPattern = /Claiming for\s*\((.+?)\)/gi;
        var match = culpritExtractPattern.exec(tag);
		match[1].split(', ').forEach((culprit, idx) => {
		    let clazz = idx % 2 === 0 ? 'twist1 claimed' : 'twist3 claimed';
		    if (fs.existsSync(`images/${culprit}.jpg`)) {
			images += `<img class='${clazz}' src="http://localhost:${proxyPort}/images/${culprit}.jpg" height="90%" style="border-radius: 20px; margin: 5px; display:none;"/>`
		    } else if (fs.existsSync(`images/${culprit}.gif`)) {
			images += `<img class='${clazz}' src="http://localhost:${proxyPort}/images/${culprit}.gif" height="90%" style="border-radius: 20px; margin: 5px; display:none;"/>`
		    } else {
			images += `<img class='${clazz}' src="http://localhost:${proxyPort}/images/unknown.jpg" height="90%" style="border-radius: 20px; margin: 5px; display:none;"/>`
		    }
		});
	
    } else if (tag.indexOf('Possible culprit:') > -1) {
        tag = tag.replace('Smylnycky, Jamie L', 'jsmylny');
        let culpritExtractPattern = /Possible culprit:\s*(.+)</gi;
        var match = culpritExtractPattern.exec(tag);
        match[1].split(', ').forEach((culprit, idx) => {
            let clazz = idx % 2 === 0 ? 'twist1 culprit' : 'twist3 culprit';
            if (fs.existsSync(`images/${culprit}.jpg`)) {
                images += `<img class='${clazz}' src="http://localhost:${proxyPort}/images/${culprit}.jpg" height="90%" style="border-radius: 20px; margin: 5px; display:none;"/>`
            } else if (fs.existsSync(`images/${culprit}.gif`)) {
                images += `<img class='${clazz}' src="http://localhost:${proxyPort}/images/${culprit}.gif" height="90%" style="border-radius: 20px; margin: 5px; display:none;"/>`
            } else {
                images += `<img class='${clazz}' src="http://localhost:${proxyPort}/images/unknown.jpg" height="90%" style="border-radius: 20px; margin: 5px; display:none;"/>`
            }
        });
    };
    
      //Now on the write side of the stream write some data using .end()
      //N.B. if end isn't called it will just hang.  
      stm.end(tag + images);      
    
    });    
}

selects.push(culpritSelect);


function createProxyServer() {
    var app = connect();
    var proxy = httpProxy.createProxyServer({
       target: `http://${jenkinsHost}`,
       agent  : http.globalAgent, 
       headers:{ host: `${jenkinsHost}`,
       'Accept-Encoding': 'identity'},
       followRedirects: true
    })

    proxy.on('error', function(error, req, res) {
        proxy.close();
        server.close();
        console.log(`Error occurred: ${error.message}`)
        setTimeout(() => {
            console.log('Trying to restart proxy....')
            createProxyServer()
        }, 60000)
    });
    
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
          } else if (req.url && req.url.indexOf('.gif') > -1) {
                var filePath = path.join(__dirname, req.url);
                var stat = fs.statSync(filePath);
                res.writeHead(200, {
                    'Content-Type': 'image/gif',
                    'Content-Length': stat.size
                });
                var readStream = fs.createReadStream(filePath);
                readStream.pipe(res);
          } else if (req.url && req.url.indexOf('clientScript.js') > -1) {
                var filePath = path.join(__dirname, req.url);
                var stat = fs.statSync(filePath);
                res.writeHead(200, {
                    'Content-Type': 'text/javascript',
                    'Content-Length': stat.size
                });
                var readStream = fs.createReadStream(filePath);
                readStream.pipe(res);
          } else {
                proxy.web(req, res);
          }
      }
    );
    
    var server = http.createServer(app);
    server.on('error', err => {
        console.log(`Error listening on port ${proxyPort}: ${err.message}`);
        proxy.close();
        server.close();
        setTimeout(() => {
            console.log('Trying to restart proxy after listen....')
            createProxyServer()
        }, 60000)
    });

    server.listen(`${proxyPort}`)
    console.log(`Server listening on port ${proxyPort}`);
}

createProxyServer();
