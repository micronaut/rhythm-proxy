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
    </style>
    <script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>
    <script>
    ${jobStatusCache}
    </script>
    <script>
        $.noConflict();
        jQuery('div.job:not(.successful)').each(function() {
            let imgs = jQuery(this).find('img');
            let claimed = imgs.filter('.claimed');
            if (claimed.length > 0) {
                jQuery(this).find('p').eq(0).addClass('inlineP').after(claimed.clone());
                imgs.remove();
                jQuery(this).find('img').wrap('<div class="img-cont"></div>');
            } else {
                imgs.wrapAll('<div class="img-cont"></div>')
                jQuery(this).find('p').eq(0).addClass('inlineP').after(imgs.parent('.img-cont'));
            }
            jQuery('.img-cont img').show();
        });
    </script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/rythm.js/2.2.4/rythm.min.js"></script>
    <script>
        let rythm = new Rythm();
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
                // rythm.start();
            }, 5000);
        } else if (document.querySelectorAll('div.job').length === document.querySelectorAll('div.successful').length) {
            localStorage.setItem('shouldPlay', 'false');
        } else {
            localStorage.setItem('shouldPlay', 'true');
            let lastTimePlayedPayAttn = localStorage.getItem('payattn');

            if (!lastTimePlayedPayAttn) {
                localStorage.setItem('payattn', new Date());
            }

            let lastTimePlayedPayAttnAsDate = lastTimePlayedPayAttn = new Date(lastTimePlayedPayAttn) || new Date();

            let now = new Date();
            let timeDiff = Math.round(((now - lastTimePlayedPayAttnAsDate) / 1000));
            let twist1 = document.querySelectorAll('img.twist1');
            let twist3 = document.querySelectorAll('img.twist3');
            if (timeDiff > 3600 && (twist1.length > 0 || twist3.length > 0)) {
                localStorage.setItem('payattn', now);
                var elems = document.querySelectorAll("div");
                elems.forEach(e => {
                    e.classList.remove("twist3", "shake3", "rythm-medium", "rythm-high", "rythm-bass");
                });

                let rnd = Math.floor(Math.random() * 4);

                if (rnd === 0) {
                    rythm.setMusic("http://localhost:${proxyPort}/culpritMusic/who-can-it-be-now.mp3");
                } else if (rnd === 1) {
                    rythm.setMusic("http://localhost:${proxyPort}/culpritMusic/dont-forget-about-me.mp3");
                } else if (rnd === 2) {
                    rythm.setMusic("http://localhost:${proxyPort}/culpritMusic/pay-attention.mp3");
                } else {
                    rythm.setMusic("http://localhost:${proxyPort}/culpritMusic/workin-for-a-livin.mp3");
                }
                // rythm.start();
            }
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
    if (tag.indexOf('Claiming for') > -1) {
        let culpritExtractPattern = /Claiming for .+ \((.+)\)/gi;
        var match = culpritExtractPattern.exec(tag);
        match[1].split(', ').forEach((culprit, idx) => {
            let clazz = idx % 2 === 0 ? 'twist1 claimed' : 'twist3 claimed';
            if (fs.existsSync(`images/${culprit}.jpg`)) {
                images += `<img class='${clazz}' src="http://localhost:${proxyPort}/images/${culprit}.jpg" height="90%" style="border-radius: 20px; margin: 5px; display:none;"/>`
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
