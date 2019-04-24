describe("client spec", () => {
  let localStorageGetItemStub, localStorageSetItemStub, triggerStub;

  beforeEach(() => {
    localStorageGetItemStub = sinon.stub(window.localStorage, "getItem");
    localStorageSetItemStub = sinon.stub(window.localStorage, "setItem");
    triggerStub = sinon.stub(jQuery.fn, 'trigger');
  });

  afterEach(() => {
    localStorageSetItemStub.restore();
    localStorageGetItemStub.restore();
    triggerStub.restore();
    $('.fixture').remove();
  });

  it("should retrieve cache", () => {
    jobStatusCache();

    sinon.assert.calledWith(localStorageGetItemStub, "jobStatusCache");
  });

  it("should not throw if cache not in localstorage", () => {
    localStorageGetItemStub.withArgs('jobStatusCache').returns(undefined);
    
    jobStatusCache();

    sinon.assert.calledWith(localStorageGetItemStub, "jobStatusCache");
  });

  it("should cache jobs status", () => {
    $("body").append(`
        <div class="fixture">
            <div class="job failing" title="job-1"></div> 
            <div class="job successful" title="job-2"></div>  
            <div class="job claimed" title="job-3"></div> 
        </div> 
    `);
    jobStatusCache();

    sinon.assert.calledWith(
      localStorageSetItemStub,
      "jobStatusCache",
      '[["job-1","failing"],["job-2","successful"],["job-3","claimed"]]'
    );
  });

  describe('if status changed', () => {

    it("should NOT add class or wrap elements if new status is NOT claimed", () => {
        localStorageGetItemStub.withArgs('jobStatusCache').returns('[["job-1","failing"],["job-2","successful"],["job-3","claimed"]]');
        $("body").append(`
            <div class="fixture">
                <div id="job1" tooltip="job-1" class="job successful building" title="job-1"><div>inner</div></div>
            </div>
        `);
        jobStatusCache();
    
        chai.expect($('#job1').hasClass('flip-card')).to.equal(false);
        chai.expect($('#job1').html()).to.equal('<div>inner</div>');
    });

    it("should add class and wrap inner elements", () => {
        localStorageGetItemStub.withArgs('jobStatusCache').returns('[["job-1","failing"],["job-2","successful"],["job-3","claimed"]]');
        $("body").append(`
            <div class="fixture">
                <div id="job1" tooltip="job-1" class="job claimed building" title="job-1"><div>inner</div></div>
            </div>
        `);
        jobStatusCache();
    
        chai.expect($('#job1').hasClass('flip-card')).to.equal(true);
        chai.expect($('#job1').html()).to.equal('<div class="flip-card-inner"><div class="flip-card-front"><div>inner</div></div><div class="flip-card-back"></div></div>');
      });
    
      it("should add element with cloned images", () => {
        localStorageGetItemStub.withArgs('jobStatusCache').returns('[["job-1","failing"],["job-2","successful"],["job-3","claimed"]]');
        $("body").append(`
            <div class="fixture">
                <div id="job1" tooltip="job-1" class="job claimed building" title="job-1"><div><img src="img/1" /><img src="img/2" /></div></div>
            </div>
        `);
        jobStatusCache();
       
        chai.expect($('#job1 .flip-card-inner').html()).to.equal('<div class="flip-card-front"><div><img src="img/1"><img src="img/2"></div></div><div class="flip-card-back"><img src="img/1"><img src="img/2"></div>');
      });

      it("should add audio element and trigger play if there are flip cards", () => {
        $("body").append(`
            <div class="fixture">
                <div class="flip-card"></div>
                <div id="main-panel"></div>
            </div>
        `);
        jobStatusCache(8000);
       
        sinon.assert.calledWith(
            triggerStub,
            "play"
        );
        chai.expect($('#main-panel').html()).to.equal('<audio class="audios" id="survey-says" controls="" preload="none"><source src="http://localhost:8000/survey-said.mp3" type="audio/mpeg"></audio>');
      });

      it("should toggle class when audio play is ended and after timeout", () => {
        let clock = sinon.useFakeTimers();

        $("body").append(`
            <div class="fixture">
                <div class="flip-card"></div>
                <div id="main-panel"></div>
            </div>
        `);
        jobStatusCache(8000);

        triggerStub.restore();
        $('#survey-says').trigger('ended');

        chai.expect($('.flip-card').hasClass('flip')).to.equal(true);
        clock.tick(2500);
        chai.expect($('.flip-card').hasClass('flip')).to.equal(true);
        clock.tick(2501);
        chai.expect($('.flip-card').hasClass('flip')).to.equal(false);
        clock.restore();
      });
  });
  
});

/*
<div id="job1" tooltip="job-1" class="job successful building" title="job-1">
            <p><a href="#">job-1</a></p>
            <p>Claiming for somebody (Body, Some).</p>
            <p></p>
            <p>Possible culprit: someone.else</p>
        </div>
*/