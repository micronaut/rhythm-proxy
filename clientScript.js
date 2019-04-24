const STATUS = ["successful", "failing", "claimed"];

function jobStatusCache(proxyPort = 8000) {
  let jobStatusCache = localStorage.getItem("jobStatusCache");
  let storedCache = jobStatusCache ? new Map(JSON.parse(jobStatusCache)) : new Map();

  jQuery("div.job").each(function() {
    let $element = jQuery(this);
    let currentStatus = $element
      .attr("class")
      .split(" ")
      .filter(c => STATUS.includes(c))
      .shift();

      let lastStatus = storedCache.get($element.attr('title')) || '';
      if (currentStatus !== lastStatus && currentStatus === 'claimed') {
        $element.addClass('flip-card').wrapInner('<div class="flip-card-front"></div>');
        let imgs = $element.find('img').clone();
        let container = jQuery('<div class="flip-card-back"></div>');
        container.append(imgs);
        $element.append(container);
        $element.wrapInner('<div class="flip-card-inner"></div>'); 
      }

      storedCache.set($element.attr("title"), currentStatus);
  });
  localStorage.setItem('jobStatusCache', JSON.stringify([...storedCache]));

  if (jQuery('.flip-card').length > 0) {
        jQuery('#main-panel').append(`<audio class="audios" id="survey-says" controls preload="none"><source src="http://localhost:${proxyPort}/survey-said.mp3" type="audio/mpeg"></audio>`);
        jQuery('#survey-says').on('ended', function() {
            jQuery('.flip-card').toggleClass('flip');
            setTimeout(function() {
                jQuery('.flip-card').toggleClass('flip');
            }, 5000);
        });
        jQuery('#survey-says').trigger('play')
    }

}

// const jobStatusCache = function jobStatusCache() {
//     let storedCache = localStorage.getItem('jobStatusCache');
//     let cache = storedCache ? new Map(JSON.parse(storedCache)) : new Map();
//     jQuery('div.job:not(.successful)').each(function() {
//         let currentStatus = jQuery(this).find('.culprit').length > 0 ? 'unclaimed' : 'claimed';
//         let lastStatus = cache.get(jQuery(this).attr('title')) || 'unclaimed';
//         cache.set(jQuery(this).attr('title'), currentStatus);
//         if (lastStatus === 'unclaimed' && currentStatus === 'claimed') {
//             jQuery(this).addClass('flip-card').wrapInner('<div class="flip-card-front"></div>');
//             let imgs = jQuery(this).find('img').clone();
//             let container = jQuery('<div class="flip-card-back"></div>');
//             container.append(imgs);
//             jQuery(this).append(container);
//             jQuery(this).wrapInner('<div class="flip-card-inner"></div>');
//         }

//     });

//     localStorage.setItem('jobStatusCache', JSON.stringify([...cache]));

//     if (jQuery('.flip-card').length > 0) {
//         jQuery('#main-panel').append('<audio class="audios" id="survey-says" controls preload="none"><source src="http://localhost:8000/survey-said.mp3" type="audio/mpeg"></audio>');
//         jQuery('#survey-says').on('ended', function() {
//             jQuery('.flip-card').toggleClass('flip');
//             setTimeout(function() {
//                 jQuery('.flip-card').toggleClass('flip');
//             }, 5000);
//         });
//         jQuery('#survey-says').trigger('play')
//     }
// };

// module.exports = jobStatusCache;

//Now building: #1257, 99% - N/A left

//Possible culprit: shubhamgovil, himanshu.dash, anshumanambasht

//claimed
//failing
//successful
