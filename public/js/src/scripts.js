var BLUELIPS = $.extend(true, {
    init: function() {
        this.initVars();
        this.initPlugins();
        this.bindEventHandlers();
        this.setupVideo();
        this.initClm();
        this.initEmotion();
    },

    initVars: function() {
        this.$feedback = $('.feedback');
        this.$content = $('.main-content');
        this.$message = $('.text-story');
        this.$score = $('.score');
        this.$phrase = $('.phrase');
        this.$media = $('.media');
        this.$face = $('.face');
        this.$body = $('body');
        this.$vid = $('#video-el');
        this.vid = this.$vid[0];
        this.$overlay = $('#overlay');
        this.overlay = this.$overlay[0];
        this.overlayCC = this.overlay.getContext('2d');
        this.$proceedBtn = $('#proceed-button');

        this.$audio = $('#audio-src');
        this.audio = this.$audio[0];

        this.data = data;

        this.name = this.data.name;
        this.colors = $.extend(true, {}, this.data.colors);
        this.audioSrc = this.data.audio;
        this.expressions = $.extend(true, {}, this.data.expressions);

        this.currTargetEmotions = {
            angry: 1.0,
            sad: 1.0,
            surprised: 1.0,
            happy: 1.0
        };
        this.currTargetTemplates = [];
        this.currColor = '';
        this.currImage = '';
        this.currPhrase = '';

        this.emotionDelta = {
            angry: 1.0,
            sad: 1.0,
            surprised: 1.0,
            happy: 1.0
        };

        this.mediaStarted = false;

        this.timer = null;
        this.feedbackTimer = null;
        this.currentFeedback = null;
        this.scoreArr = [];
        this.score = 0.000;
        this.finalScore = 0.000;

        this.gradeInfo = {
            APlus: {
                grade: 'A+',
                message: 'Good job actor. You can put that report card on the fridge!',
                className: 'A'
            },
            A: {
                grade: 'A',
                message: 'Good job actor. You really stared at that computer.',
                className: 'A'
            },
            AMinus: {
                grade: 'A-',
                message: 'Good job actor. If you weren\'t an overachiever you would have been happy right now.',
                className: 'A'
            },
            BPlus: {
                grade: 'B+',
                message: 'You did it actor! After all a B+ is almost an A-...',
                className: 'B'
            },
            B: {
                grade: 'B',
                message: 'You did it actor. How does it feel to be average?',
                className: 'B'
            },
            BMinus: {
                grade: 'B-',
                message: 'You did it actor. You didn\'t get a C!',
                className: 'B'
            },
            C: {
                grade: 'C',
                message: 'Well... This depends on your perspective! Some people believe that a C is average.',
                className: 'C'
            },
            F: {
                grade: 'F',
                message: 'You have disappointed me. Please find a way of redeeming yourself.',
                className: 'F'
            }
        };
    },

    initPlugins: function() {

    },

    bindEventHandlers: function() {
        this.$proceedBtn.on('click', this.goToGrades.bind(this));
        this.$audio.on('timeupdate', this.audioPositionChanged.bind(this));
        this.$audio.on('ended', this.handleEndScene.bind(this));
    },

    getGradeInfo: function() {
        // if (this.finalScore > 90) {
        //     return this.gradeInfo.APlus;
        // } else if (this.finalScore > 85) {
        //     return this.gradeInfo.A;
        // } else if (this.finalScore > 80) {
        //     return this.gradeInfo.AMinus;
        // } else if (this.finalScore > 75) {
        //     return this.gradeInfo.BPlus;
        // } else if (this.finalScore > 70) {
        //     return this.gradeInfo.B;
        // } else if (this.finalScore > 60) {
        //     return this.gradeInfo.BMinus;
        // } else if (this.finalScore > 50) {
        //     return this.gradeInfo.C;
        // } else {
        //     return this.gradeInfo.F;
        // }

        if (this.finalScore > 65) {
            return this.gradeInfo.APlus;
        } else if (this.finalScore > 62.5) {
            return this.gradeInfo.A;
        } else if (this.finalScore > 60) {
            return this.gradeInfo.AMinus;
        } else if (this.finalScore > 57) {
            return this.gradeInfo.BPlus;
        } else if (this.finalScore > 53) {
            return this.gradeInfo.B;
        } else if (this.finalScore > 50) {
            return this.gradeInfo.BMinus;
        } else if (this.finalScore > 40) {
            return this.gradeInfo.C;
        } else {
            return this.gradeInfo.F;
        }
    },

    goToGrades: function(e) {
        var gradeInfo = this.getGradeInfo();
        var message = gradeInfo.message;
        var grade = gradeInfo.grade;
        var className = gradeInfo.className;

        var h2 = '<h2>' + grade + '</h2>';
        var p = '<p>' + message + '</p>';
        var text = '<div class="text text-grades">' + h2 + p + '</div>';
        var button = '<input class="btn" id="retake-button" type="button" value="click to retake course">';
        var link = '<a href=' + this.name + '>' + button + '</a>';
        var controls = '<div class="controls">' + link + '</div>';
        var info = '<div class="info grades ' + className + '">' + text + controls + '</div>';
        var panel = '<div class="panel">' + info + '</div>';

        this.$content.html(panel);

    },

    handleEndScene: function(e) {
        clearTimeout(this.timer);
        clearTimeout(this.feedbackTimer);

        var sum = this.scoreArr.reduce(function(a, b) { return parseFloat(a) + parseFloat(b) });
        this.finalScore = this.scoreArr.length === 0 ? sum : (sum / this.scoreArr.length);

        var greatScore = 0;
        var goodScore = 0;
        var okScore = 0;
        for (var i = 0; i < this.scoreArr.length; i++) {
            if (parseFloat(this.scoreArr[i]) >= 100) {
                greatScore += 1;
            } else if (parseFloat(this.scoreArr[i]) >= 75) {
                goodScore += 1;
            } else {
                okScore += 1;
            }
        }


        var len = this.scoreArr.length;
        var generalScore = ((greatScore * 100) + (goodScore * 75)) / len;
        this.finalScore = generalScore;
        console.log(this.finalScore);
        // alert(generalScore + ', ' + this.finalScore);


        // greatScore = greatScore / len;
        // goodScore = goodScore / len;
        // okScore = okScore / len;

        // alert(greatScore + ', ' + goodScore + ', ' + okScore + ', ' + this.finalScore);

        this.$proceedBtn.removeClass('hide');
        this.$feedback.css({
            'background': 'none'
        });
        this.resetBackgroundColor();
    },

    resetBackgroundColor: function() {
        this.$body.css('background-color', '#eee');
    },

    initAudio: function() {
        this.$audio.attr('src', this.audioSrc);
        this.audio.play();
        this.audioPos = 0;
    },

    updateTimer: function() {
        this.scoreArr.push(this.score);
        this.$score.html(this.score);
        this.timer = setTimeout(this.updateTimer.bind(this), 100);
    },

    updateFeedback: function() {
        var newFeedback;

        if (this.score >= 100) {
            newFeedback = 'great';
        } else if (this.score >= 75) {
            newFeedback = 'good';
        } else {
            newFeedback = 'ok';
        }

        // if (this.score > 80) {
        //     newFeedback = 'great';
        // } else if (this.score > 70) {
        //     newFeedback = 'good';
        // } else if (this.score > 50) {
        //     newFeedback = 'ok';
        // } else {
        //     newFeedback = 'bad';
        // }

        // if (this.currentFeedback !== newFeedback) {
        //     console.log('changing gif');
        //     this.setFeedback(newFeedback);
        // } else {
        //     this.setFeedback('ok');
        // }

        this.setFeedback(newFeedback);

        this.currentFeedback = newFeedback;
        this.feedbackTimer = setTimeout(this.updateFeedback.bind(this), 500);
    },

    // get position of the audio
    // change the background color of the document based off the position
    audioPositionChanged: function(e) {
        this.audioPos = this.audio.currentTime;

        for (colTime in this.colors) {
            if (this.audioPos > colTime) {
                this.changeBackgroundColor('#' + this.colors[colTime], parseFloat(colTime));
            }
        }

        for (expTime in this.expressions) {
            if (this.audioPos > expTime) {
                this.changeExpression(this.expressions[expTime].image, this.expressions[expTime].phrase, this.expressions[expTime].emotions, this.expressions[expTime].templates, parseFloat(expTime));
            }
        }
    },

    setFeedback: function(newFeedback) {
        if (newFeedback === 'ok') {
            this.$feedback.css({
                'background': 'none'
            });
        } else {
            this.$feedback.css({
                'background': 'url("/images/screens/' + newFeedback + '.gif") center 90px / 320px auto no-repeat'
            });

            // setTimeout(function() {
            //     this.$feedback.css({
            //         'background': 'none'
            //     });
            // }.bind(this), 1500);
        }
    },

    changeExpression: function(imageSrc, phrase, emotions, templates, timePos) {
        if (imageSrc !== this.currImage) {
            this.$face.css({
                'background': 'url("' + imageSrc + '") center 70px / 250px auto no-repeat'
            });
            this.currImage = imageSrc;
        }

        if (phrase !== this.currPhrase) {
            this.$phrase.html(phrase);
            this.currPhrase = phrase;
        }

        if (emotions !== undefined && Object.keys(emotions).length > 0) {
            this.currTargetEmotions = $.extend(true, {}, emotions);
            // console.log(this.currTargetEmotions);
        }

        this.currTargetTemplates = templates;

    },

    changeBackgroundColor: function(color, timePos) {
        if (color !== this.currColor) {
            this.$body.css('background-color', color);
            this.currColor = color;
            // console.log(this.currColor);
        }
    },

    setupVideo: function() {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

        // check for camerasupport
        if (navigator.getUserMedia) {
            // set up stream
            var videoSelector = {video : true};
            if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
                var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
                if (chromeVersion < 20) {
                    videoSelector = "video";
                }
            };

            var context = this;
            navigator.getUserMedia(videoSelector, function( stream ) {
                if (context.vid.mozCaptureStream) {
                    context.vid.mozSrcObject = stream;
                } else {
                    context.vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
                }
                context.vid.play();
            }, function() {
                alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
            });
        } else {
            alert("This demo depends on getUserMedia, which your browser does not seem to support. :(");
        }

        this.$vid.on('canplay', this.enableStart.bind(this));
    },

    enableStart: function() {
        this.$proceedBtn.attr('value', 'proceed');
        this.$proceedBtn.attr('disabled', null);

        this.$message.addClass('hide');
        this.startMedia();
    },

    initClm: function() {
        this.ctrack = new clm.tracker({useWebGL: true});
        this.ctrack.init(pModel);
    },

    startMedia: function() {
        this.mediaStarted = !this.mediaStarted;
        if (this.mediaStarted) {
            //start audio
            this.initAudio();

            //start video
            this.vid.play();

            //start tracking
            this.ctrack.start(this.vid);

            //start loop to draw face
            this.drawLoop();

            //start scoring
            this.updateTimer();

            setTimeout(this.updateFeedback.bind(this), 1000);
        }
    },

    drawLoop: function() {
        requestAnimFrame(this.drawLoop.bind(this));
        this.overlayCC.clearRect(0, 0, 400, 300);

        var cpos = this.ctrack.getCurrentPosition();
        if (cpos) {
            this.ctrack.draw(this.overlay);
            // this.updatePos(cpos);
        }

        var cparam = this.ctrack.getCurrentParameters();
        var er = this.ec.meanPredict(cparam);
        if (er) {
            this.updateScore(er);
        }
    },

    initEmotion: function() {
        this.ec = new emotionClassifier();
        this.ec.init(emotionModel);
        this.emotionData = this.ec.getBlank();
    },

    updateScore: function(data) {
        // var d
        // var emotions = data.forEach(function(d, i, arr) {

        // }.bind(this));

        // console.log(this.currTargetTemplates);
        var emotionScores = [];
        for (var i = 0; i < data.length; i ++) {
            var emotion = data[i].emotion;
            var value = parseFloat(data[i].value);
            var emotionScore;
            var isTemplate = false;
            for (var j = 0; j < this.currTargetTemplates.length; j++) {
                var template = this.currTargetTemplates[j];
                if (emotion === template) {
                    isTemplate = true;
                    // console.log(isTemplate);
                }
            }

            if (isTemplate) {
                emotionScore = (value >= 0.5) ? 100 : 0;
            } else {
                emotionScore = (value < 0.5) ? 100 : 0;
            }

            emotionScores.push(emotionScore);
        }

        var emotionScoreAvg = 0;
        for (var i = 0; i < emotionScores.length; i++) {
            emotionScoreAvg += emotionScores[i];
        }

        emotionScoreAvg = emotionScoreAvg/4;

        this.score = emotionScoreAvg.toFixed(3);

        /*for (var i = 0; i < data.length; i++) {
            var emotion = data[i].emotion;
            var value = parseFloat(data[i].value);

            this.emotionDelta.angry = Math.abs(value - this.currTargetEmotions.angry);
            this.emotionDelta.sad = Math.abs(value - this.currTargetEmotions.sad);
            this.emotionDelta.surprised = Math.abs(value - this.currTargetEmotions.surprised);
            this.emotionDelta.happy = Math.abs(value - this.currTargetEmotions.happy);

            var avg = (this.emotionDelta.angry
                + this.emotionDelta.sad
                + this.emotionDelta.surprised
                + this.emotionDelta.happy) / 4.0;

            var newScore = (1.0 - avg) * 100.0;


            for (var i = 0; i < this.currTargetTemplates.length; i++) {
                if (emotion === this.currTargetTemplates[i]) {
                    if (value > 0.5) {

                    } else {

                    }
                }
            }


            this.score = newScore.toFixed(3);
        }*/
    },

    updatePos: function(positions) {
        for (var i = 0; i < positions.length; i++) {
            // console.log(positions[i]);
        }
    }

}, window.BLUELIPS || (window.BLUELIPS = {}));

BLUELIPS.init();
