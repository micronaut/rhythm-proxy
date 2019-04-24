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
    updateJobStatusCache();

    sinon.assert.calledWith(localStorageGetItemStub, "jobStatusCache");
  });

  it("should not throw if cache not in localstorage", () => {
    localStorageGetItemStub.withArgs('jobStatusCache').returns(undefined);
    
    updateJobStatusCache();

    sinon.assert.calledWith(localStorageGetItemStub, "jobStatusCache");
  });

  it("should cache jobs status", () => {
    $("body").append(`
        <div class="fixture">
            <div class="job failing" tooltip="job-1"></div> 
            <div class="job successful" tooltip="job-2"></div>  
            <div class="job claimed" tooltip="job-3"></div> 
        </div> 
    `);
    updateJobStatusCache();

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
        updateJobStatusCache();
    
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
        updateJobStatusCache();
    
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
        updateJobStatusCache();
       
        chai.expect($('#job1 .flip-card-inner').html()).to.equal('<div class="flip-card-front"><div><img src="img/1"><img src="img/2"></div></div><div class="flip-card-back"><img src="img/1"><img src="img/2"></div>');
      });

      it("should add audio element and trigger play if there are flip cards", () => {
        $("body").append(`
            <div class="fixture">
                <div class="flip-card"></div>
                <div id="main-panel"></div>
            </div>
        `);
        updateJobStatusCache(8000);
       
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
        updateJobStatusCache(8000);

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

  it("should wrap images for unsuccessful jobs", () => {
    $("body").append(`
        <div class="fixture">
            <div class="job failing" id="job1"><img id="img1" src="img/1" /><img id="img2" src="img/2" /></div> 
            <div class="job successful" id="job2"></div>  
            <div class="job claimed" id="job3"><p>something</p><img id="img3" src="img/3" class="claimed"/></div> 
        </div> 
    `);
    wrapImages();

    chai.expect($('.img-cont').length).to.equal(2);
    chai.expect($('#job1').html()).to.equal('<div class="img-cont"><img id="img1" src="img/1"><img id="img2" src="img/2"></div>');
    chai.expect($('#job2').html()).to.equal('');
    chai.expect($('#job3').html()).to.equal('<p class="inlineP">something</p><div class="img-cont"><img id="img3" src="img/3" class="claimed"></div>');
  });

    describe('radiator dance', () => {
        let setMusicStub, addRythmStub, startStub;

        beforeEach(() => {
            setMusicStub = sinon.stub();
            addRythmStub = sinon.stub();
            startStub = sinon.stub();
            let handler = {
                construct(target, argumentList) {
                    return {
                        setMusic: setMusicStub,
                        addRythm: addRythmStub, 
                        start: startStub
                    }
                }
            };
            Rythm = new Proxy(Rythm, handler);
        });

        afterEach(() => {
            localStorageSetItemStub.restore();
            localStorageGetItemStub.restore();
            $('.fixture').remove();
        });

        it('should initialize rythymjs', () => {
            doRadiatorDanceIfItsTime({soundFileDir: 'soundFileDir', songs: ['song1']});

            sinon.assert.calledWith(setMusicStub, "http://localhost:8000/soundFileDir/song1");
            sinon.assert.calledWith(addRythmStub, "shake3", "shake", 0, 10, { direction: "left", min: 5, max: 100 });
            sinon.assert.calledWith(addRythmStub, "twist1", "twist", 0, 10);
            sinon.assert.calledWith(addRythmStub, "twist3", "twist", 0, 10, { direction: "left" });
        });

        it('should start rythymjs and update localstorage if dev env', () => {
            let clock = sinon.useFakeTimers();

            doRadiatorDanceIfItsTime({soundFileDir: 'soundFileDir', songs: ['song1'], devEnv: true});

            sinon.assert.calledWith(localStorageSetItemStub, 'shouldPlay', 'false');
            clock.tick(5001);
            sinon.assert.called(startStub);

            clock.restore();
        });

        it('should start rythymjs and update localstorage if localstorage shouldPlay is true and all jobs are successful', () => {
            let clock = sinon.useFakeTimers();
            $("body").append(`
                <div class="fixture">
                    <div class="job successful" id="job1"></div> 
                    <div class="job successful" id="job2"></div>  
                    <div class="job successful" id="job3"></div> 
                </div> 
            `);
            localStorageGetItemStub.withArgs('shouldPlay').returns('true');

            doRadiatorDanceIfItsTime({soundFileDir: 'soundFileDir', songs: ['song1'], devEnv: false});

            sinon.assert.calledWith(localStorageSetItemStub, 'shouldPlay', 'false');
            clock.tick(5001);
            sinon.assert.called(startStub);

            clock.restore();
        });

        it('should NOT start rythymjs but updates localstorage if localstorage shouldPlay is false but all jobs are successful', () => {
            let clock = sinon.useFakeTimers();
            $("body").append(`
                <div class="fixture">
                    <div class="job successful" id="job1"></div> 
                    <div class="job successful" id="job2"></div>  
                    <div class="job successful" id="job3"></div> 
                </div> 
            `);
            localStorageGetItemStub.withArgs('shouldPlay').returns('false');

            doRadiatorDanceIfItsTime({soundFileDir: 'soundFileDir', songs: ['song1'], devEnv: false});

            sinon.assert.calledWith(localStorageSetItemStub, 'shouldPlay', 'false');
            clock.tick(5001);
            sinon.assert.notCalled(startStub);

            clock.restore();
        });

        describe('pay attention', () => {
            it('should start rythymjs and update localstorage if time has expired and images exist with twist1 class', () => {
                localStorageGetItemStub.withArgs('payattn').returns(new Date(2019, 1, 1, 0, 0, 0));
                let clock = sinon.useFakeTimers({
                    now: new Date(2019, 1, 1, 0, 0, 3601)
                });
                
                $("body").append(`
                    <div class="fixture">
                        <div class="job failed" id="job1"><img class="twist1"/></div> 
                        <div class="job successful" id="job2"></div>  
                        <div class="job successful" id="job3"></div> 
                    </div> 
                `);
                localStorageGetItemStub.withArgs('shouldPlay').returns('true');
    
                doRadiatorDanceIfItsTime({soundFileDir: 'soundFileDir', songs: ['song1'], devEnv: false});
    
                sinon.assert.calledWith(localStorageSetItemStub);
                sinon.assert.called(startStub);
    
                clock.restore();
            });

            it('should NOT start rythymjs and if time has NOT expired', () => {
                localStorageGetItemStub.withArgs('payattn').returns(new Date(2019, 1, 1, 0, 0, 0));
                let clock = sinon.useFakeTimers({
                    now: new Date(2019, 1, 1, 0, 0, 3599)
                });
                
                $("body").append(`
                    <div class="fixture">
                        <div class="job failed" id="job1"><img class="twist1"/></div> 
                        <div class="job successful" id="job2"></div>  
                        <div class="job successful" id="job3"></div> 
                    </div> 
                `);
                localStorageGetItemStub.withArgs('shouldPlay').returns('true');
    
                doRadiatorDanceIfItsTime({soundFileDir: 'soundFileDir', songs: ['song1'], devEnv: false});
    
                sinon.assert.calledWith(localStorageSetItemStub);
                sinon.assert.notCalled(startStub);
    
                clock.restore();
            });
        });
    });
  
});
