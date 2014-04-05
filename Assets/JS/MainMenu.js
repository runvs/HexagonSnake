var HexagonSnake = HexagonSnake || {};

HexagonSnake.MainMenu = function(game)
{
    console.log('%c MainMenu Constructor ', 'background: #eee; color: #b000b5');

    this.music = null;
    this.playButton = null;
};

HexagonSnake.MainMenu.prototype =
{

    create: function()
    {

        HexagonSnake.music = this.add.audio('music');
        HexagonSnake.music.play('', 0, 1, true);

        this.game.stage.backgroundColor = "#030710";

        // Create the menu text
        this.createText();

        // Create the tutorial sprite
        var tutorialSprite = this.add.sprite(this.game.width / 2, this.game.height / 2, 'tut');
        tutorialSprite.anchor.x = 0.5;
        tutorialSprite.anchor.y = 0.5;

        // Create the mute button
        this.muteButton = this.add.button(this.game.width, 0, 'mute', this.musicMutechange, this, 1, 0, 0);
        this.muteButton.anchor.setTo(1, 0);
        this.muteButton.visible = true;

        // Add the mute button's particle emitter
        this.particleEmitterMuteButton = this.add.emitter(0, 0, 100);
        this.particleEmitterMuteButton.makeParticles('tile');  
        this.particleEmitterMuteButton.alpha = 1;
        this.particleEmitterMuteButton.maxParticleScale= 0.5;
        this.particleEmitterMuteButton.minParticleScale = 0.25;
        this.particleEmitterMuteButton.minParticleSpeed.setTo(-HexagonSnake.config.PARTICLESPEEDRANGE, -HexagonSnake.config.PARTICLESPEEDRANGE);
        this.particleEmitterMuteButton.maxParticleSpeed.setTo(HexagonSnake.config.PARTICLESPEEDRANGE, HexagonSnake.config.PARTICLESPEEDRANGE);
        this.particleEmitterMuteButton.gravity = 200;

        this.input.onDown.add(this.startGame, this);
    },

    update: function()
    {

        //  Do some nice funky main menu effect here

    },

    startGame: function(pointer)
    {

        //  And start the actual game
        this.game.state.start('Game');

    },

    musicMutechange: function()
    {
        var clickSound = this.add.audio('turn');
        clickSound.play('', 0, 0.35);

        this.game.sound.mute = !this.game.sound.mute;
        
        this.particleBurstMuteButton();
        if(this.game.sound.mute)
        {
            this.muteButton.setFrames(0,1,1)   
        }
        else
        { 
            this.muteButton.setFrames(1,0,0) 
        }
    },

    particleBurstMuteButton: function()
    {
        // Position the emitter where the mouse/touch event was
        this.particleEmitterMuteButton.alpha = 1;
        this.particleEmitterMuteButton.x = this.muteButton.x - 0.5 * this.muteButton.width ;
        this.particleEmitterMuteButton.y = this.muteButton.y + 0.5 * this.muteButton.height;

        // The first parameter sets the effect to "explode" which means all particles are emitted at once
        // The second gives each particle a 2000ms lifespan
        // The third is ignored when using burst/explode mode
        // The final parameter (10) is how many particles will be emitted in this single burst
        this.particleEmitterMuteButton.start(true, HexagonSnake.config.PARTICLEFADEOUTTIME, null, HexagonSnake.config.PARTICLENUMBER);

        var particleAlphaTween = this.add.tween(this.particleEmitterMuteButton).to({ alpha: 0 }, HexagonSnake.config.PARTICLEFADEOUTTIME, Phaser.Easing.Cubic.Out, true);
        particleAlphaTween.onComplete.add(function (){ this.particleEmitterMuteButton.alpha = 0; } , this);
    },

    createText: function()
    {
        var textLeftMargin = this.game.width / 20;
        var textTopMargin = this.game.width / 20;
        playerItemText = this.game.add.text(textLeftMargin, textTopMargin, '0 ' + i18n[HexagonSnake.lang][1] , {
            font: '20px Arial',
            fill: ' #6088ff',
            align: 'left'
        });
        playerItemText.anchor.setTo(0, 0.5);
        playerItemText.setText('');

        remainingHexagonText = this.game.add.text(this.game.width - textLeftMargin, textTopMargin, '' + this.remainingHexagonsForThisLevel + ' ' + i18n[HexagonSnake.lang][12] , {
            font: '20px Arial',
            fill: ' #6088ff',
            align: 'right'
        });
        remainingHexagonText.anchor.setTo(2, 0.5);
        remainingHexagonText.setText('');

        gameOverText = this.game.add.text(this.game.width / 2, this.game.height / 2, i18n[HexagonSnake.lang][2], {
            font: '25px Arial',
            fill: ' #ff8860',
            align: 'center'
        });
        gameOverText.setText('');
        gameOverText.anchor.setTo(0.5, 0.5);


        menuTextGameName = this.game.add.text(this.game.width/2, textTopMargin, i18n[HexagonSnake.lang][0], {
            font: '45px Arial',
            fill: ' #ff8860',
            align: 'left'
        });
        menuTextGameName.anchor.setTo(0.5,0.5);

        menuTextCredits = this.game.add.text(textLeftMargin, this.game.height - textTopMargin, i18n[HexagonSnake.lang][11], {
            font: '15px Arial',
            fill: ' #ff8860',
            align: 'left'
        });
        menuTextCredits.anchor.setTo(0,1);


        // plattform dependent text
        if (this.game.device.desktop)
        {
            menuTextInfo = this.game.add.text(this.game.width/2, 65, i18n[HexagonSnake.lang][3], {
                font: '25px Arial',
                fill: ' #ff8860',
                align: 'left'
            });
            menuTextInfo.anchor.setTo(0.5,0.5);

            menuTextTutorial1 = this.game.add.text(textLeftMargin, this.game.height/2 - 25, i18n[HexagonSnake.lang][5], {
                font: '25px Arial',
                fill: ' #7799ff',
                align: 'left'
            });
            menuTextTutorial1.anchor.setTo(0,0.5);

            menuTextTutorial2 = this.game.add.text(this.game.width - textLeftMargin, this.game.height/2 + 25, i18n[HexagonSnake.lang][7], {
                font: '25px Arial',
                fill: ' #7799ff',
                align: 'left'
            });
            menuTextTutorial2.anchor.setTo(1,0.5);

         
        }
        else    // on mobile devices
        {
            menuTextInfo = this.game.add.text(this.game.width/2, 65, i18n[HexagonSnake.lang][4], {
                font: '25px Arial',
                fill: ' #ff8860',
                align: 'left'
            });
            menuTextInfo.anchor.setTo(0.5,0.5);

            menuTextTutorial1 = this.game.add.text(textLeftMargin, this.game.height/2 - 25,  i18n[HexagonSnake.lang][6], {
                font: '25px Arial',
                fill: ' #7799ff',
                align: 'left'
            });
            menuTextTutorial1.anchor.setTo(0,0.5);

            menuTextTutorial2 = this.game.add.text(this.game.width - textLeftMargin, this.game.height/2 + 25, i18n[HexagonSnake.lang][8], {
                font: '25px Arial',
                fill: ' #7799ff',
                align: 'left'
            });
            menuTextTutorial2.anchor.setTo(1,0.5);
        }
    }

};