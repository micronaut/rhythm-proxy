const jobStatusCache = function jobStatusCache() {
    let storedCache = localStorage.getItem('jobStatusCache');
    let cache = storedCache ? new Map(JSON.parse(storedCache)) : new Map();
    jQuery('div.job:not(.successful)').each(function() {
        let currentStatus = jQuery(this).find('.culprit').length > 0 ? 'unclaimed' : 'claimed'; 
        let lastStatus = cache.get(jQuery(this).attr('title')) || 'unclaimed';
        cache.set(jQuery(this).attr('title'), currentStatus);
        if (lastStatus === 'unclaimed' && currentStatus === 'claimed') {
            jQuery(this).addClass('flip-card').wrapInner('<div class="flip-card-front"></div>');
            let imgs = jQuery(this).find('img').clone();
            let container = jQuery('<div class="flip-card-back"></div>');
            container.append(imgs);
            jQuery(this).append(container);
            jQuery(this).wrapInner('<div class="flip-card-inner"></div>');
        }
        
    });

    localStorage.setItem('jobStatusCache', JSON.stringify([...cache])); 

    if (jQuery('.flip-card').length > 0) {
        jQuery('#main-panel').append('<audio class="audios" id="survey-says" controls preload="none"><source src="http://localhost:8000/survey-said.mp3" type="audio/mpeg"></audio>');
        jQuery('#survey-says').on('ended', function() {
            jQuery('.flip-card').toggleClass('flip');
            setTimeout(function() {
                jQuery('.flip-card').toggleClass('flip');
            }, 5000);
        });
        jQuery('#survey-says').trigger('play')
    }
};

module.exports = jobStatusCache;



//Now building: #1257, 99% - N/A left

//Possible culprit: shubhamgovil, himanshu.dash, anshumanambasht

//claimed
//failing
