var HexagonSnake = HexagonSnake || {};

HexagonSnake.Game = function(game)
{
    console.log('%c Game Constructor ', 'background: #eee; color: #b000b5');

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game
    this.add;       //  used to add sprites, text, groups, etc
    this.camera;    //  a reference to the game camera
    this.cache;     //  the game cache
    this.input;     //  the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load;      //  for preloading assets
    this.math;      //  lots of useful common math operations
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc
    this.stage;     //  the game stage
    this.time;      //  the clock
    this.tweens;    //  the tween manager
    this.state;     //  the state manager
    this.world;     //  the game world
    this.particles; //  the particle manager
    this.physics;   //  the physics manager
    this.rnd;       //  the repeatable random number generator

    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

    this.config =
    {
        HEXAGON_SIZE: 50,
        WORLD_SIZE:
        {
            x: 8,
            y: 10
        },
        INPUT_INCREMENT: 50,
        MOVEMENT_INCREMENT_CURRENT: 800,
        MOVEMENT_INCREMENT_START: 800,
        MOVEMENT_INCREMENT_DELTA: 13,
        MOVEMENT_INCREMENT_MIN: 70, 
        SCORE_MULTIPLIER: 225,
        PARTICLEFADEOUTTIME: 500,
        PARTICLENUMBER:15,
        PARTICLESPEEDRANGE:150,
        TRAIL_ALPHA: 0.85
    };

    this.DirectionEnum = {
        NORTH     : 0,
        NORTHEAST : 1,
        SOUTHEAST : 2,
        SOUTH     : 3,
        SOUTHWEST : 4,
        NORTHWEST : 5
    }

    this.playerTrail = [{x: 0, y: 1}, {x: 0, y: 1}];
    this.itemPosition = {x : 0, y : 1};
    
    this.hexagonParameters = {};
    this.hexagons = [];
    this.disabledHexagonsList = [];

    this.playerItemCounter = 0;

    this.tweensFinished = false;
    this.numberOfDirectionChangesInCurrentMovement = 0;

    this.inputTimer = 0;
    this.movementTimer = 0;
};

HexagonSnake.Game.prototype =
{

    create: function()
    {
        this.isGameOver = false;

        // Set hexagon parameters
        this.hexagonParameters.size = this.config.HEXAGON_SIZE;
        this.hexagonParameters.s    = this.config.HEXAGON_SIZE / 2.0;
        this.hexagonParameters.h    = this.config.HEXAGON_SIZE / 4.0;
        this.hexagonParameters.r    = this.config.HEXAGON_SIZE / 2.0;

        this.hexagonGroup = this.add.group();
        this.playerGroup = this.add.group();
        this.disabledHexagonGroup = this.add.group();

        // Set up input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors.right.onDown.add(this.player1TurnRight, this);
        this.cursors.left.onDown.add(this.player1TurnLeft, this);

        this.cursors.a = this.input.keyboard.addKey(Phaser.Keyboard.A);
        this.cursors.a.onDown.add(this.player1TurnLeft,this);

        this.cursors.d = this.input.keyboard.addKey(Phaser.Keyboard.D);
        this.cursors.d.onDown.add(this.player1TurnRight,this);

        this.input.onDown.add(this.doTouchInput, this);

        this.cursors.f = this.input.keyboard.addKey(Phaser.Keyboard.F);
        this.cursors.f.onDown.add(function() { this.stage.scale.startFullScreen(); }, this);

        // Create item
        this.item = this.add.sprite(0, 0, 'item');
        this.item.anchor.x = 0.25;
        this.item.anchor.y = 0;
        this.item.animations.add('ani');
        this.item.animations.play('ani', 8, true);
        this.item.alpha = 0;

        this.inputTimer = 0;

        // Set up player trail and direction
        this.playerTrail[0].x = 4;
        this.playerTrail[0].y = 2;
        this.playerTrail[1].x = 4;
        this.playerTrail[1].y = 1;
        this.player1Direction = this.DirectionEnum.SOUTH;

        // Create mute and twitter buttons
        this.muteButton = this.add.button(this.game.width, 0, 'mute', this.musicMutechange, this, 1, 0, 0);
        this.muteButton.anchor.setTo(1, 0);
        this.muteButton.visible = true;

        this.twitterButton = this.add.button(this.game.width / 2, this.game.height / 2 + 45 * 2, 'twitter', this.tweetScore);
        this.twitterButton.anchor.setTo(0.5, 0.5);
        this.twitterButton.visible = false;

        // Create particle emitter for item pickups
        this.particleEmitterItemPickup = this.add.emitter(0, 0, 100);
        this.particleEmitterItemPickup.makeParticles('item');  
        this.particleEmitterItemPickup.alpha = 1;
        this.particleEmitterItemPickup.maxParticleScale= 0.5;
        this.particleEmitterItemPickup.minParticleScale = 0.25;
        this.particleEmitterItemPickup.minParticleSpeed.setTo(-this.config.PARTICLESPEEDRANGE, -this.config.PARTICLESPEEDRANGE);
        this.particleEmitterItemPickup.maxParticleSpeed.setTo(this.config.PARTICLESPEEDRANGE, this.config.PARTICLESPEEDRANGE);
        this.particleEmitterItemPickup.gravity = 200;

        // Set hexagons' y position
        this.hexagonGroup.y = this.disabledHexagonGroup.y = this.playerGroup.y = this.game.height * -window.devicePixelRatio;

        // Set up the tweens
        // Start tweens
        this.hexagonStartTween = this.add.tween(this.hexagonGroup).to({ y: 0 }, 2000, Phaser.Easing.Bounce.Out, false);
        this.disabledHexagonStartTween = this.add.tween(this.disabledHexagonGroup).to({ y: 0 }, 2000, Phaser.Easing.Bounce.Out, false);
        this.playerStartTween = this.add.tween(this.playerGroup).to({ y: 0 }, 2000, Phaser.Easing.Bounce.Out, false);
        this.playerStartTween.onComplete.add(function() {
            this.tweensFinished = true;
        }, this);
        // End tweens
        this.playerTween = this.add.tween(this.playerGroup).to({ y: this.game.height * window.devicePixelRatio }, 1200, Phaser.Easing.Cubic.In, false);
        this.hexagonTween = this.add.tween(this.hexagonGroup).to({ y: this.game.height * window.devicePixelRatio }, 1200, Phaser.Easing.Cubic.In, false);
        this.disabledHexagonTween = this.add.tween(this.disabledHexagonGroup).to({ y: this.game.height * window.devicePixelRatio }, 1200, Phaser.Easing.Cubic.In, false);

        // Finally set some basic values
        this.repositionPlayerSprites();

        this.disabledHexagonCount = 2;
        this.currentLevel = 0;
        this.remainingHexagonsForThisLevel = 5;

        // Switch into the game
        this.createText();

        for(var i = 0; i < this.config.WORLD_SIZE.x + 1; i++) 
        {
            for(var j = 1; j < this.config.WORLD_SIZE.y + 1; j++) 
            {
                this.hexagons.push(new Hexagon(i, j, this.game, this.hexagonParameters, 'tile', this.hexagonGroup));
            }
        }

        this.item.alpha = 1;

        this.hexagonStartTween.start();
        this.playerStartTween.start();
        this.disabledHexagonStartTween.start();

        this.getNewRandomItemPosition();
        this.hexagonGroup.add(this.item);

        this.muteButton.visible = true;

        this.getNewRandomDisabledHexagons();
    },

    update: function()
    {
        // Is the snake head on an item?
        if(this.playerTrail[0].x == this.itemPosition.x && this.playerTrail[0].y == this.itemPosition.y)
        {
            this.flashHexagons(this.itemPosition.x, this.itemPosition.y);

            this.playerTrail.push({ x: this.itemPosition.x, y: this.itemPosition.y });
            this.playerItemCounter++;
            this.getNewRandomItemPosition();

            this.remainingHexagonsForThisLevel--;

            // Change the text
            this.remainingHexagonText.setText(this.remainingHexagonsForThisLevel + ' ' + i18n[HexagonSnake.lang][12]);
            this.playerItemText.setText(this.config.SCORE_MULTIPLIER * this.playerItemCounter + ' ' + i18n[HexagonSnake.lang][1]);

            // Increment snake speed
            this.config.MOVEMENT_INCREMENT_CURRENT = this.config.MOVEMENT_INCREMENT_START - (this.config.MOVEMENT_INCREMENT_DELTA * this.playerItemCounter);
            if(this.config.MOVEMENT_INCREMENT_CURRENT <= this.config.MOVEMENT_INCREMENT_MIN)
            {
                this.config.MOVEMENT_INCREMENT_CURRENT = this.config.MOVEMENT_INCREMENT_MIN;
            }

            // Play sound
            var pickupSound = this.add.audio('pickup');
            pickupSound.play('', 0, 0.25);
            this.particleBurstItemPickup();

            if(this.remainingHexagonsForThisLevel <= 0)
            {
                this.switchIntoBetweenLevelScreen();
            }
        }


        if(this.isGameOver)
        {
            var deviceDependentRestartText = '';
            if (this.game.device.desktop)
            {  
                deviceDependentRestartText = i18n[HexagonSnake.lang][9];
            }
            else
            {
                deviceDependentRestartText = i18n[HexagonSnake.lang][10];
            }

            this.gameOverText.setText(i18n[HexagonSnake.lang][2] + '\n' + deviceDependentRestartText);
        }

        this.doPlayerMovement();
        this.repositionItem();
    },

    flashHexagons: function(x, y)
    {
        // Flash the 6 hexagons around a certain position
        for(var i = 0; i < this.hexagons.length; i++)
        {
            var offset = 0;

            if(x % 2 == 0)
            {
                offset--;
            }

            if(    (this.hexagons[i].x == x - 1 && this.hexagons[i].y == y     + offset)  // Top left
                || (this.hexagons[i].x == x - 1 && this.hexagons[i].y == y + 1 + offset)  // Bottom left
                || (this.hexagons[i].x == x     && this.hexagons[i].y == y + 1         )  // Bottom
                || (this.hexagons[i].x == x + 1 && this.hexagons[i].y == y + 1 + offset)  // Bottom right
                || (this.hexagons[i].x == x + 1 && this.hexagons[i].y == y     + offset)  // Top right
                || (this.hexagons[i].x == x     && this.hexagons[i].y == y - 1         )  // Top
                || (this.hexagons[i].x == x     && this.hexagons[i].y == y             )) // Middle
            {
                this.hexagons[i].graphics.animations.play('ani', 18, false);
            }
        }
    },

    switchIntoBetweenLevelScreen: function()
    {
        // FIXME Tween and Juice

        var oldPlayerItemCount = this.playerItemCounter;
        this.currentLevel++;
        this.disabledHexagonCount += 3;
        this.remainingHexagonsForThisLevel = 5 + this.currentLevel * 2;
        this.getNewRandomDisabledHexagons();
        this.resetGame();
        
        this.playerItemCounter = oldPlayerItemCount;
    },

    resetGame: function()
    {
        this.playerTween.stop();
        this.hexagonTween.stop();
        this.disabledHexagonTween.stop();

        this.twitterButton.visible = false;

        this.playerItemText.x = this.game.width / 20;
        this.playerItemText.y = this.game.height / 20;
        this.playerItemText.anchor.x = 0;

        this.playerTween = this.add.tween(this.playerGroup).to({ y: this.game.height * window.devicePixelRatio }, 1200, Phaser.Easing.Cubic.In, false);
        this.hexagonTween = this.add.tween(this.hexagonGroup).to({ y: this.game.height * window.devicePixelRatio }, 1200, Phaser.Easing.Cubic.In, false);
        this.disabledHexagonTween = this.add.tween(this.hexagonGroup).to({ y: this.game.height * window.devicePixelRatio }, 1200, Phaser.Easing.Cubic.In, false);

        this.playerGroup.y = 0;
        this.hexagonGroup.y = 0;
        this.disabledHexagonGroup.y = 0;

        this.playerTrail =
        [
            { x: 4, y: 2},
            { x: 4, y: 1}
        ];

        this.playerItemCounter = 0;
        this.config.MOVEMENT_INCREMENT_CURRENT = this.config.MOVEMENT_INCREMENT_START;
        this.playerItemText.setText(this.config.SCORE_MULTIPLIER * this.playerItemCounter + i18n[HexagonSnake.lang][1]);

        this.isGameOver = false;
        this.gameOverText.setText('');

        this.getNewRandomItemPosition();

        this.player1Direction = this.DirectionEnum.SOUTHEAST;
    },

    createText: function()
    {
        var textLeftMargin = this.game.width / 20;
        var textTopMargin = this.game.width / 20;

        this.playerItemText = this.add.text(textLeftMargin, textTopMargin, '0 ' + i18n[HexagonSnake.lang][1] , {
            font: '20px Arial',
            fill: ' #6088ff',
            align: 'left'
        });
        this.playerItemText.anchor.setTo(0, 0.5);
        this.playerItemText.setText('');

        this.remainingHexagonText = this.add.text(this.game.width - textLeftMargin, textTopMargin, '' + this.remainingHexagonsForThisLevel + ' ' + i18n[HexagonSnake.lang][12] , {
            font: '20px Arial',
            fill: ' #6088ff',
            align: 'right'
        });
        this.remainingHexagonText.anchor.setTo(2, 0.5);
        this.remainingHexagonText.setText('');

        this.gameOverText = this.add.text(this.game.width / 2, this.game.height / 2, i18n[HexagonSnake.lang][2], {
            font: '25px Arial',
            fill: ' #ff8860',
            align: 'center'
        });
        this.gameOverText.setText('');
        this.gameOverText.anchor.setTo(0.5, 0.5);

        this.playerItemText.setText('0 ' + i18n[HexagonSnake.lang][1]);
        this.remainingHexagonText.setText('' + this.remainingHexagonsForThisLevel + ' ' + i18n[HexagonSnake.lang][12]);
    },

    doTouchInput: function(pointer)
    {

        if(pointer.y > 60)
        {
            if(pointer.x < this.game.width / 2)
            {
                this.player1TurnLeft();
            }
            else
            {
                this.player1TurnRight();
            }
        }

        if(this.isGameOver)
        {
            if(pointer.x < twitterButton.x - twitterButton.width * 2
                || pointer.x > twitterButton.x + twitterButton.width * 2)
            {
                if(pointer.y < twitterButton.y - twitterButton.width * 2
                    || pointer.y > twitterButton.y + twitterButton.width * 2)
                {
                    this.resetGame();
                }
            }
        }

    },

    player1TurnRight: function()
    {
        if(!this.isGameOver)
        {
            if(this.numberOfDirectionChangesInCurrentMovement < 2)
            {
                this.player1Direction++;
                if(this.player1Direction > this.DirectionEnum.NORTHWEST)
                {
                    this.player1Direction = this.DirectionEnum.NORTH;
                }
                this.numberOfDirectionChangesInCurrentMovement++;

                var turnSound = this.add.audio('turn');
                turnSound.play('', 0, 0.4);
                this.repositionPlayerSprites();
            }
        }
    },

    player1TurnLeft: function()
    {
        if(!this.isGameOver)
        {
            if(this.numberOfDirectionChangesInCurrentMovement > -2)
            {
                this.player1Direction--;
                if(this.player1Direction < this.DirectionEnum.NORTH)
                {
                    this.player1Direction = this.DirectionEnum.NORTHWEST;
                }
                this.numberOfDirectionChangesInCurrentMovement--;

                var turnSound = this.add.audio('turn');
                turnSound.play('', 0, 0.4);
                this.repositionPlayerSprites();
            }
        }
    },

    repositionPlayerSprites: function()
    {
        if(!this.isGameOver)
        {
            this.playerGroup.removeAll();

            // FIXME: Do not remove all but only the last one
            //playerGroup.sort('spriteIndexAsInTrail');

            for(var i = 0; i < this.playerTrail.length; i++)
            {
                var newCoords = this.getScreenPosition(this.playerTrail[i].x, this.playerTrail[i].y);
                var orientationName = '';
                if(this.player1Direction == this.DirectionEnum.NORTH)
                {
                    orientationName = "playerheadN";
                }
                else if(this.player1Direction == this.DirectionEnum.SOUTH)
                {
                    orientationName = "playerheadS";
                }
                else if(this.player1Direction == this.DirectionEnum.NORTHWEST)
                {
                    orientationName = "playerheadNW";
                }
                else if(this.player1Direction == this.DirectionEnum.NORTHEAST)
                {
                    orientationName = "playerheadNE";
                }
                else if(this.player1Direction == this.DirectionEnum.SOUTHEAST)
                {
                    orientationName = "playerheadSE";
                }
                else if(this.player1Direction == this.DirectionEnum.SOUTHWEST)
                {
                    orientationName = "playerheadSW";
                }

                var p = this.add.sprite(newCoords.x, newCoords.y, (i == 0 ? orientationName : 'player'));
                p.anchor.x = 0.25;
                p.anchor.y = 0;
                p.alpha = (i == 0 ? 1 : this.config.TRAIL_ALPHA);
                this.playerGroup.add(p);
            }
        }
    },

    getNewRandomItemPosition: function()
    {
        var newItemPosition = {};
        newItemPosition.x = this.rnd.integerInRange(1, this.config.WORLD_SIZE.x);
        newItemPosition.y = this.rnd.integerInRange(1, this.config.WORLD_SIZE.y);

        for(var i = 0; i < this.playerTrail.length; i++)
        {
            if(this.playerTrail[i].x == newItemPosition.x && this.playerTrail[i].y == newItemPosition.y)
            {
                this.getNewRandomItemPosition();
                return;
            }
        }

        for(var i = 0; i < this.disabledHexagonsList.length; i++)
        {
            if(this.disabledHexagonsList[i].x == newItemPosition.x && this.disabledHexagonsList[i].y == newItemPosition.y)
            {
                this.getNewRandomItemPosition();
                return;
            }
        }

        this.itemPosition = newItemPosition;
    },

    getScreenPosition: function(tileX, tileY)
    {
        var pos = [{ x: 0, y: 1 }];
        pos.x = tileX * (this.config.HEXAGON_SIZE ) + (this.hexagonParameters.h);

        if(tileX % 2 == 0)
        {
            pos.y = tileY  * (this.config.HEXAGON_SIZE) + tileY * this.hexagonParameters.h;
        }
        else 
        {
            pos.y = (tileY + 0.61) * (this.config.HEXAGON_SIZE) + tileY * this.hexagonParameters.h;
        }

        return pos;
    },


    repositionItem: function()
    {
        var itemScreenPos = this.getScreenPosition(this.itemPosition.x, this.itemPosition.y);
        this.item.x = itemScreenPos.x;
        this.item.y = itemScreenPos.y;
    },

    getNewRandomDisabledHexagons: function()
    {
        // Clear the array
        this.disabledHexagonsList = [];

        // Clear the group
        this.disabledHexagonGroup.removeAll();

        // FIXME Not directly on or in front of Player's spawing position

        for(var i = 0; i < this.disabledHexagonCount; i++)
        {
            var pos = {x : 0, y : 1};

            pos.x = this.rnd.integerInRange(2, this.config.WORLD_SIZE.x - 1);  // not on the outer layer, since this could lead to unbeatable situations
            pos.y = this.rnd.integerInRange(2, this.config.WORLD_SIZE.y - 1);
           
            this.disabledHexagonsList[i] = pos;

            newCoords = this.getScreenPosition(pos.x, pos.y);
            var p = this.add.sprite(newCoords.x, newCoords.y, 'blocked');
            p.anchor.x = 0.25;
            p.anchor.y = 0;
            //p.alpha = (i == 0 ? 1 : config.TRAIL_ALPHA);
            this.disabledHexagonGroup.add(p);
        }
    },

    quitGame: function(pointer)
    {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

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

    particleBurstItemPickup: function() 
    {
        //  Position the emitter where the mouse/touch event was
        var pos =  this.getScreenPosition(this.playerTrail[0].x, this.playerTrail[0].y);
        this.particleEmitterItemPickup.x = pos.x + this.hexagonParameters.h;
        this.particleEmitterItemPickup.y = pos.y + this.hexagonParameters.s;

        //  The first parameter sets the effect to "explode" which means all particles are emitted at once
        //  The second gives each particle a 2000ms lifespan
        //  The third is ignored when using burst/explode mode
        //  The final parameter (10) is how many particles will be emitted in this single burst
        this.particleEmitterItemPickup.start(true, this.config.PARTICLEFADEOUTTIME, null, this.config.PARTICLENUMBER);

        var particleAlphaTween = this.add.tween(this.particleEmitterItemPickup).to({ alpha: 0 }, this.config.PARTICLEFADEOUTTIME, Phaser.Easing.Linear.Out, true);
        particleAlphaTween.onComplete.add(function (){ this.particleEmitterItemPickup.alpha = 1; }, this);
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
        this.particleEmitterMuteButton.start(true, this.config.PARTICLEFADEOUTTIME, null, this.config.PARTICLENUMBER);

        var particleAlphaTween = this.add.tween(this.particleEmitterMuteButton).to({ alpha: 0 }, this.config.PARTICLEFADEOUTTIME, Phaser.Easing.Cubic.Out, true);
        particleAlphaTween.onComplete.add(function(){ this.particleEmitterMuteButton.alpha = 0; }, this);
    },

    particleBurstTwitterButton: function() 
    {
        //  Position the emitter where the mouse/touch event was
        this.particleEmitterMuteButton.alpha = 1;
        this.particleEmitterMuteButton.x = this.twitterButton.x - 0.5 * this.twitterButton.width ;
        this.particleEmitterMuteButton.y = this.twitterButton.y + 0.5 * this.twitterButton.height;

        //  The first parameter sets the effect to "explode" which means all particles are emitted at once
        //  The second gives each particle a 2000ms lifespan
        //  The third is ignored when using burst/explode mode
        //  The final parameter (10) is how many particles will be emitted in this single burst
        this.particleEmitterMuteButton.start(true, this.config.PARTICLEFADEOUTTIME, null, this.config.PARTICLENUMBER);

        var particleAlphaTween = this.add.tween(this.particleEmitterMuteButton).to({ alpha: 0 }, this.config.PARTICLEFADEOUTTIME, Phaser.Easing.Cubic.Out, true);
        particleAlphaTween.onComplete.add(function(){ this.particleEmitterMuteButton.alpha = 0; }, this);
    },

    doPlayerMovement: function()
    {
        if(this.time.now > this.movementTimer && !this.isGameOver && this.tweensFinished)
        {
            this.movementTimer = this.time.now + this.config.MOVEMENT_INCREMENT_CURRENT;
            this.numberOfDirectionChangesInCurrentMovement = 0;

            //var moveSound = this.add.audio('move');
            //moveSound.play("", 0, 0.35);

            for(var i = this.playerTrail.length - 1; i >= 1; i--)
            {
                this.playerTrail[i].x = this.playerTrail[i - 1].x;
                this.playerTrail[i].y = this.playerTrail[i - 1].y;
            }

            if(this.player1Direction == this.DirectionEnum.NORTH)
            {
                this.movePlayer1North();
            }
            else if(this.player1Direction == this.DirectionEnum.NORTHEAST)
            {
                this.movePlayer1NorthEast();
            }
            else if(this.player1Direction == this.DirectionEnum.SOUTHEAST)
            {
                this.movePlayer1SouthEast();
            }
            else if(this.player1Direction == this.DirectionEnum.SOUTH)
            {
                this.movePlayer1South();
            }
            else if(this.player1Direction == this.DirectionEnum.SOUTHWEST)
            {
                this.movePlayer1SouthWest();
            }
            else if(this.player1Direction == this.DirectionEnum.NORTHWEST)
            {
                this.movePlayer1NorthWest();
            }

            // Is the head of the Snake on any of its tail positions?
            for(var i = 1; i < this.playerTrail.length; i++)
            {
                if(this.playerTrail[0].x == this.playerTrail[i].x && this.playerTrail[0].y == this.playerTrail[i].y)
                {
                    this.switchToGameOver();
                }
            }

            // Is the head of the snake on any of the disabled hexagons?
            for(var i = 0; i < this.disabledHexagonsList.length; i++)
            {
                if(this.playerTrail[0].x == this.disabledHexagonsList[i].x && this.playerTrail[0].y == this.disabledHexagonsList[i].y)
                {
                    this.switchToGameOver();
                }   
            }

            this.repositionPlayerSprites();
        }
        else if(!this.tweensFinished)
        {
            this.repositionPlayerSprites();
        }
    },

    movePlayer1North: function()
    {
        if(!this.isGameOver)
        {
            if(this.playerTrail[0].y > 1)
            {
                this.playerTrail[0].y -= 1;
            }
            else 
            {
                this.switchToGameOver();
            }
        }
    },

    movePlayer1NorthEast: function()
    {
        if(!this.isGameOver)
        {
            if(!(this.playerTrail[0].x < this.config.WORLD_SIZE.x))
            {
                this.switchToGameOver();
            }

            if(this.playerTrail[0].x % 2 == 0)
            {
                this.movePlayer1North();
            }
            
            if(this.playerTrail[0].x < this.config.WORLD_SIZE.x)
            {
                this.playerTrail[0].x += 1;
            }
        }
    },

    movePlayer1SouthEast: function()
    {
        if(!this.isGameOver)
        {
            if(!(this.playerTrail[0].x < this.config.WORLD_SIZE.x))
            {
                this.switchToGameOver();
            }

            if(this.playerTrail[0].x % 2 == 1)
            {
                this.movePlayer1South();
            }
            
            if(this.playerTrail[0].x < this.config.WORLD_SIZE.x)
            {
                this.playerTrail[0].x += 1;
            }
        }
    },

    movePlayer1South: function()
    {
        if(!this.isGameOver)
        {
            if(this.playerTrail[0].y < this.config.WORLD_SIZE.y)
            {
                this.playerTrail[0].y += 1;
            }
            else 
            {
                this.switchToGameOver();
            }
        }
    },

    movePlayer1SouthWest: function()
    {
        if(!this.isGameOver)
        {
            if(!(this.playerTrail[0].x >= 1))
            {
                this.switchToGameOver();
            }
            if(this.playerTrail[0].x % 2 == 1)
            {
                this.movePlayer1South();
            }

            if(this.playerTrail[0].x >= 1)
            {
                this.playerTrail[0].x -= 1;
            }

        }
    },

    movePlayer1NorthWest: function()
    {
        
        if(!this.isGameOver)
        {
            if(!(this.playerTrail[0].x >= 1))
            {
                this.switchToGameOver();
            }
            if(this.playerTrail[0].x % 2 == 0)
            {
                this.movePlayer1North();
            }

            if(this.playerTrail[0].x >= 1)
            {
                this.playerTrail[0].x -= 1;
            }
        }
    },

    switchToGameOver: function()
    {
        this.isGameOver = true;

        var failSound = this.add.audio('fail');
        failSound.play('', 0, 0.125);
        
        this.playerTween.start();
        this.hexagonTween.start();
        this.disabledHexagonTween.start();

        this.playerItemText.x = this.game.width / 2;
        this.playerItemText.y = this.game.height / 2 + 45;
        this.playerItemText.anchor.x = 0.5;

        this.twitterButton.visible = true;
    },

    tweetScore: function()
    {
        // TODO localize the tweet
        if(this.isGameOver)
        {
            var url = 'https://twitter.com/intent/tweet?url=http://j.mp/1oHrlCm&text=I%27ve%20just%20reached%20$score$%20on%20%23HexagonSnake';

            this.particleBurstTwitterButton();
            window.open(url.replace('$score$', this.config.SCORE_MULTIPLIER * this.playerItemCounter + ' Points'));
        }
    }

};