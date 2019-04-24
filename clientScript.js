const STATUS = ["successful", "failing", "claimed"];

function updateJobStatusCache(proxyPort = 8000) {
  let jobStatusCache = localStorage.getItem("jobStatusCache");
  let storedCache = jobStatusCache
    ? new Map(JSON.parse(jobStatusCache))
    : new Map();
  jQuery("div.job").each(function() {
    let $element = jQuery(this);
    let currentStatus = $element
      .attr("class")
      .split(" ")
      .filter(c => STATUS.includes(c))
      .shift();

    let lastStatus = storedCache.get($element.attr("title")) || "";
    if (currentStatus !== lastStatus && currentStatus === "claimed") {
      $element
        .addClass("flip-card")
        .wrapInner('<div class="flip-card-front"></div>');
      let imgs = $element.find("img").clone();
      let container = jQuery('<div class="flip-card-back"></div>');
      container.append(imgs);
      $element.append(container);
      $element.wrapInner('<div class="flip-card-inner"></div>');
    }
    storedCache.set($element.attr("tooltip"), currentStatus);
  });
  localStorage.setItem("jobStatusCache", JSON.stringify([...storedCache]));

  if (jQuery(".flip-card").length > 0) {
    jQuery("#main-panel").append(
      `<audio class="audios" id="survey-says" controls preload="none"><source src="http://localhost:${proxyPort}/survey-said.mp3" type="audio/mpeg"></audio>`
    );
    jQuery("#survey-says").on("ended", function() {
      jQuery(".flip-card").toggleClass("flip");
      setTimeout(function() {
        jQuery(".flip-card").toggleClass("flip");
      }, 5000);
    });
    jQuery("#survey-says").trigger("play");
  }
}

function wrapImages() {
  jQuery("div.job:not(.successful)").each(function() {
    let $element = jQuery(this);
    let imgs = $element.find("img");
    let claimed = imgs.filter(".claimed");
    if (claimed.length > 0) {
      $element
        .find("p")
        .eq(0)
        .addClass("inlineP")
        .after(claimed.clone());
      imgs.remove();
      $element.find("img").wrap('<div class="img-cont"></div>');
    } else {
      imgs.wrapAll('<div class="img-cont"></div>');
      $element
        .find("p")
        .eq(0)
        .addClass("inlineP")
        .after(imgs.parent(".img-cont"));
    }
    jQuery(".img-cont img").show();
  });
}

function doRadiatorDanceIfItsTime({proxyPort = 8000, soundFileDir = '', songs = [], devEnv = false}) {
    let rythm = new Rythm();
    let song = songs[Math.floor(Math.random() * songs.length)];
    rythm.setMusic(`http://localhost:${proxyPort}/${soundFileDir}/${song}`);
    rythm.addRythm("shake3", "shake", 0, 10, { direction: "left", min: 5, max: 100 });
    rythm.addRythm("twist1", "twist", 0, 10);
    rythm.addRythm("twist3", "twist", 0, 10, { direction: "left" });

    let shouldPlay = localStorage.getItem('shouldPlay') || 'false';

    if (devEnv || (shouldPlay === 'true' && jQuery('div.job').length === jQuery('div.successful').length)) {
        localStorage.setItem('shouldPlay', 'false');
        setTimeout(function() {
            rythm.start();
        }, 5000);
    } else if (jQuery('div.job').length === jQuery('div.successful').length) {
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
        if (timeDiff > 3600 && (jQuery('img.twist1').length > 0 || jQuery('img.twist3').length > 0)) {
            localStorage.setItem('payattn', now);
            jQuery("div").removeClass("twist3 shake3 rythm-medium rythm-high rythm-bass");

            let rnd = Math.floor(Math.random() * 4);
            if (rnd === 0) {
                rythm.setMusic(`http://localhost:${proxyPort}/culpritMusic/who-can-it-be-now.mp3`);
            } else if (rnd === 1) {
                rythm.setMusic(`http://localhost:${proxyPort}/culpritMusic/dont-forget-about-me.mp3`);
            } else if (rnd === 2) {
                rythm.setMusic(`http://localhost:${proxyPort}/culpritMusic/pay-attention.mp3`);
            } else {
                rythm.setMusic(`http://localhost:${proxyPort}/culpritMusic/workin-for-a-livin.mp3`);
            }
            rythm.start();
        }
    } 
}
