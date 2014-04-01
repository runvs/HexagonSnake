var config =
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

var game;
var item;
var playerGroup;
var playerTrail = [{x: 0, y: 1}, {x: 0, y: 1}];

var particleEmitterItemPickup;

var cursors;

var inputTimer = 0;
var movementTimer = 0;

var hexagonParameters = {};
var hexagons = [];

var itemPosition = {x : 0, y : 1};

var playerItemCounter = 0;
var playerItemText;

var music;

var isInMenu;
var menuTextGameName;
var menuTextInfo;
var menuTextTutorial1;
var menuTextTutorial2;
var menuTextCredits;

var isGameOver;
var gameOverText;

var playerTween;
var hexagonTween;
var playerStartTween;
var hexagonStartTween;

var muteButton, twitterButton;
var particleEmitterMuteButton;

var tweensFinished = false;

var numberOfDirectionChangesInCurrentMovement = 0;

var tutorialSprite;

var lang = navigator.language.substr(0, 2);

DirectionEnum = {
    NORTH     : 0,
    NORTHEAST : 1,
    SOUTHEAST : 2,
    SOUTH     : 3,
    SOUTHWEST : 4,
    NORTHWEST : 5
}

var player1Direction;

function preload()
{
	game.load.image('player', 'Assets/GFX/PlayerTrail.png');
    game.load.spritesheet('tile', 'Assets/GFX/tile.png', 51, 45);
    game.load.image('playerheadN', 'Assets/GFX/PlayerN.png');
    game.load.image('playerheadNE', 'Assets/GFX/PlayerNE.png');
    game.load.image('playerheadSE', 'Assets/GFX/PlayerSE.png');
    game.load.image('playerheadNW', 'Assets/GFX/PlayerNW.png');
    game.load.image('playerheadSW', 'Assets/GFX/PlayerSW.png');
    game.load.image('playerheadS', 'Assets/GFX/PlayerS.png');
    game.load.image('tut', 'Assets/GFX/tut.png');

    game.load.spritesheet('item', 'Assets/GFX/tileBlocked.png', 51, 45);

    game.load.image('twitter', 'Assets/GFX/twitter.png');
    game.load.spritesheet('mute', 'Assets/GFX/mute.png', 51, 44);

    game.load.audio('pickup', ['Assets/Audio/pickup.ogg', 'Assets/Audio/pickup.mp3']);
    game.load.audio('fail', ['Assets/Audio/fail.ogg', 'Assets/Audio/fail.mp3']);
    game.load.audio('turn', ['Assets/Audio/turn.ogg', 'Assets/Audio/turn.mp3']);
    game.load.audio('move', ['Assets/Audio/move.ogg', 'Assets/Audio/move.mp3']);
    game.load.audio('music', ['Assets/Audio/music.ogg', 'Assets/Audio/music.mp3']);
}

function create()
{
    if(typeof(i18n[lang]) == 'undefined')
    {
        lang = 'en';
    }

    game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
    game.stage.scale.setShowAll();
    game.stage.scale.refresh();

    isInMenu = true;
    isGameOver = false;

    game.stage.backgroundColor = "#030710";
    // Set hexagon parameters
    hexagonParameters.size = config.HEXAGON_SIZE;
    hexagonParameters.s = config.HEXAGON_SIZE / 2.0;
    hexagonParameters.h = config.HEXAGON_SIZE / 4.0;
    hexagonParameters.r = config.HEXAGON_SIZE / 2.0;

    game.hexagonGroup = game.add.group();

    playerGroup = game.add.group();

	cursors = game.input.keyboard.createCursorKeys();
    cursors.right.onDown.add(player1TurnRight, this);
    cursors.left.onDown.add(player1TurnLeft, this);

    cursors.a = game.input.keyboard.addKey(Phaser.Keyboard.A);
    cursors.a.onDown.add(player1TurnLeft,this);

    cursors.d = game.input.keyboard.addKey(Phaser.Keyboard.D);
    cursors.d.onDown.add(player1TurnRight,this);    
    
    game.input.onDown.add(doTouchInput, this);

    cursors.m = game.input.keyboard.addKey(Phaser.Keyboard.M);
    cursors.m.onDown.add(musicMutechange, this);

    cursors.r = game.input.keyboard.addKey(Phaser.Keyboard.R);
    cursors.r.onDown.add(resetGame, this);
    
    cursors.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    cursors.space.onDown.add(switchIntoGame, this);

    cursors.t = game.input.keyboard.addKey(Phaser.Keyboard.T);
    cursors.t.onDown.add(tweetScore, this);

    cursors.f = game.input.keyboard.addKey(Phaser.Keyboard.F);
    cursors.f.onDown.add(function() { game.stage.scale.startFullScreen(); }, this);

    item = game.add.sprite(0, 0, 'item');
    item.anchor.x = 0.25;
    item.anchor.y = 0;
    item.animations.add('ani');
    item.animations.play('ani', 8, true);
    item.alpha = 0;
    getNewRandomItemPosition();

    inputTimer = 0;

    playerTrail[0].x = 4;
    playerTrail[0].y = 2;
    playerTrail[1].x = 4;
    playerTrail[1].y = 1;
    player1Direction = DirectionEnum.SOUTH;

    music = game.add.audio('music');
    music.play('', 0, 1, true);

    muteButton = game.add.button(game.width, 0, 'mute', musicMutechange, this, 1,0,0);
    muteButton.anchor.setTo(1, 0);
    muteButton.visible = true;
    twitterButton = game.add.button(game.width, 0, 'twitter', tweetScore);
    twitterButton.anchor.setTo(1.9, -0.7);
    twitterButton.visible = false;


    particleEmitterItemPickup = game.add.emitter(0, 0, 100);
    particleEmitterItemPickup.makeParticles('item');  
    particleEmitterItemPickup.alpha = 1;
    particleEmitterItemPickup.maxParticleScale= 0.5;
    particleEmitterItemPickup.minParticleScale = 0.25;
    particleEmitterItemPickup.minParticleSpeed.setTo(-config.PARTICLESPEEDRANGE, -config.PARTICLESPEEDRANGE);
    particleEmitterItemPickup.maxParticleSpeed.setTo(config.PARTICLESPEEDRANGE, config.PARTICLESPEEDRANGE);
    particleEmitterItemPickup.gravity = 200;

    particleEmitterMuteButton = game.add.emitter(0, 0, 100);
    particleEmitterMuteButton.makeParticles('tile');  
    particleEmitterMuteButton.alpha = 1;
    particleEmitterMuteButton.maxParticleScale= 0.5;
    particleEmitterMuteButton.minParticleScale = 0.25;
    particleEmitterMuteButton.minParticleSpeed.setTo(-config.PARTICLESPEEDRANGE, -config.PARTICLESPEEDRANGE);
    particleEmitterMuteButton.maxParticleSpeed.setTo(config.PARTICLESPEEDRANGE, config.PARTICLESPEEDRANGE);
    particleEmitterMuteButton.gravity = 200;


    game.hexagonGroup.y = playerGroup.y = game.height * -window.devicePixelRatio;

    playerTween = game.add.tween(playerGroup).to({ y: game.height * window.devicePixelRatio }, 1200, Phaser.Easing.Cubic.In, false);
    hexagonTween = game.add.tween(game.hexagonGroup).to({ y: game.height * window.devicePixelRatio }, 1200, Phaser.Easing.Cubic.In, false);
    playerStartTween = game.add.tween(playerGroup).to({ y: 0 }, 2000, Phaser.Easing.Bounce.Out, false);
    hexagonStartTween = game.add.tween(game.hexagonGroup).to({ y: 0 }, 2000, Phaser.Easing.Bounce.Out, false);
    playerStartTween.onComplete.add(function() {
        tweensFinished = true;
    }, this);

  

    createText();

    tutorialSprite = game.add.sprite(game.width/2, game.height/2, 'tut');
    tutorialSprite.anchor.x=0.5;
    tutorialSprite.anchor.y=0.5;

    repositionPlayerSprites();


    
}


function createText()
{
      var textLeftMargin = game.width/20;
    var textTopMargin = game.width/20;
     playerItemText = game.add.text(textLeftMargin, textTopMargin, "0 " + i18n[lang][1] , {
        font: "20px Arial",
        fill: " #6088ff",
        align: "left"
    });
    playerItemText.anchor.setTo(0, 0.5);
    playerItemText.setText("");

    gameOverText = game.add.text(game.width / 2, game.height / 2, i18n[lang][2], {
        font: "25px Arial",
        fill: " #ff8860",
        align: "center"
    });
    gameOverText.setText("");
    gameOverText.anchor.setTo(0.5, 0.5);


    menuTextGameName = game.add.text(game.width/2, textTopMargin, i18n[lang][0], {
        font: "45px Arial",
        fill: " #ff8860",
        align: "left"
    });
    menuTextGameName.anchor.setTo(0.5,0.5);

    menuTextCredits = game.add.text(textLeftMargin, game.height - textTopMargin, i18n[lang][11], {
        font: "15px Arial",
        fill: " #ff8860",
        align: 'left'
    });
    menuTextCredits.anchor.setTo(0,1);


    // plattform dependent text
    if (game.device.desktop)
    {
        menuTextInfo = game.add.text(game.width/2, 65, i18n[lang][3], {
            font: "25px Arial",
            fill: " #ff8860",
            align: 'left'
        });
        menuTextInfo.anchor.setTo(0.5,0.5);

        menuTextTutorial1 = game.add.text(textLeftMargin, game.height/2 - 25, i18n[lang][5], {
            font: "25px Arial",
            fill: " #7799ff",
            align: 'left'
        });
        menuTextTutorial1.anchor.setTo(0,0.5);

        menuTextTutorial2 = game.add.text(game.width - textLeftMargin, game.height/2 + 25, i18n[lang][7], {
            font: "25px Arial",
            fill: " #7799ff",
            align: 'left'
        });
        menuTextTutorial2.anchor.setTo(1,0.5);

     
    }
    else    // on mobile devices
    {
        menuTextInfo = game.add.text(game.width/2, 65, i18n[lang][4], {
            font: "25px Arial",
            fill: " #ff8860",
            align: 'left'
        });
        menuTextInfo.anchor.setTo(0.5,0.5);

        menuTextTutorial1 = game.add.text(textLeftMargin, game.height/2 - 25,  i18n[lang][6], {
            font: "25px Arial",
            fill: " #7799ff",
            align: 'left'
        });
        menuTextTutorial1.anchor.setTo(0,0.5);

        menuTextTutorial2 = game.add.text(game.width - textLeftMargin, game.height/2 + 25, i18n[lang][8], {
            font: "25px Arial",
            fill: " #7799ff",
            align: 'left'
        });
        menuTextTutorial2.anchor.setTo(1,0.5);
    }
}

function particleBurstItemPickup() 
{
    //  Position the emitter where the mouse/touch event was
    var pos =  getScreenPosition(playerTrail[0].x, playerTrail[0].y);
    particleEmitterItemPickup.x = pos.x + hexagonParameters.h;
    particleEmitterItemPickup.y = pos.y + hexagonParameters.s;

    //  The first parameter sets the effect to "explode" which means all particles are emitted at once
    //  The second gives each particle a 2000ms lifespan
    //  The third is ignored when using burst/explode mode
    //  The final parameter (10) is how many particles will be emitted in this single burst
    particleEmitterItemPickup.start(true, config.PARTICLEFADEOUTTIME, null, config.PARTICLENUMBER);

    var particleAlphaTween = game.add.tween(particleEmitterItemPickup).to({ alpha: 0 }, config.PARTICLEFADEOUTTIME, Phaser.Easing.Linear.Out, true);
    particleAlphaTween.onComplete.add(function (){particleEmitterItemPickup.alpha = 1;} , this);
}

function particleBurstMuteButton() 
{
    //  Position the emitter where the mouse/touch event was
    particleEmitterMuteButton.alpha = 1;
    particleEmitterMuteButton.x = muteButton.x - 0.5 * muteButton.width ;
    particleEmitterMuteButton.y = muteButton.y + 0.5 * muteButton.height;

    //  The first parameter sets the effect to "explode" which means all particles are emitted at once
    //  The second gives each particle a 2000ms lifespan
    //  The third is ignored when using burst/explode mode
    //  The final parameter (10) is how many particles will be emitted in this single burst
    particleEmitterMuteButton.start(true, config.PARTICLEFADEOUTTIME, null, config.PARTICLENUMBER);

    var particleAlphaTween = game.add.tween(particleEmitterMuteButton).to({ alpha: 0 }, config.PARTICLEFADEOUTTIME, Phaser.Easing.Cubic.Out, true);
    particleAlphaTween.onComplete.add(function (){particleEmitterMuteButton.alpha = 0;} , this);
}

function particleBurstTwitterButton() 
{
    //  Position the emitter where the mouse/touch event was
    particleEmitterMuteButton.alpha = 1;
    particleEmitterMuteButton.x = twitterButton.x - 0.5 * twitterButton.width ;
    particleEmitterMuteButton.y = twitterButton.y + 0.5 * twitterButton.height;

    //  The first parameter sets the effect to "explode" which means all particles are emitted at once
    //  The second gives each particle a 2000ms lifespan
    //  The third is ignored when using burst/explode mode
    //  The final parameter (10) is how many particles will be emitted in this single burst
    particleEmitterMuteButton.start(true, config.PARTICLEFADEOUTTIME, null, config.PARTICLENUMBER);

    var particleAlphaTween = game.add.tween(particleEmitterMuteButton).to({ alpha: 0 }, config.PARTICLEFADEOUTTIME, Phaser.Easing.Cubic.Out, true);
    particleAlphaTween.onComplete.add(function (){particleEmitterMuteButton.alpha = 0;} , this);
}



function switchToGameOver()
{
    isGameOver = true;

    var failSound = game.add.audio('fail');
    failSound.play("", 0, 0.125);
    playerTween.start();
    hexagonTween.start();

    twitterButton.visible = true;
}

function switchIntoGame()
{
    if(isInMenu)
    {
        playerItemText.setText("0 " + i18n[lang][1]);
        menuTextGameName.setText("");
        menuTextInfo.setText("");
        menuTextCredits.setText("");
        menuTextTutorial1.setText("");
        menuTextTutorial2.setText("");
        tutorialSprite.visible = false;

        for (var i = 0; i < config.WORLD_SIZE.x + 1; i++) 
        {
            for (var j = 1; j < config.WORLD_SIZE.y + 1; j++) 
            {
                hexagons.push(new Hexagon(i, j, game, hexagonParameters, 'tile'));
            }
        }

        item.alpha = 1;

        hexagonStartTween.start();
        playerStartTween.start();

        getNewRandomItemPosition();
        game.hexagonGroup.add(item);
        isInMenu = false;

        muteButton.visible = true;
    }
    else
    {
        if(isGameOver)
        {
            resetGame();
        }
    }
}

function doTouchInput(pointer)
{
    if(!isInMenu)
    {
        if(pointer.y > 60)
        {
            if( pointer.x < game.width/2)
            {
                player1TurnLeft();
            }
            else
            {
                player1TurnRight();
            }
        }

        if(isGameOver)
        {
            if(!(pointer.x > game.width - 2 * twitterButton.width && pointer.x < game.width
                && pointer.y < twitterButton.height + twitterButton.height * -twitterButton.anchor.y))
            {
                resetGame();
            }
        }
    }
    else
    {
        switchIntoGame();
    }
}


function player1TurnRight()
{
    if(!isGameOver && !isInMenu)
    {
        if(numberOfDirectionChangesInCurrentMovement < 2)
        {
            
            player1Direction++;
            if(player1Direction > DirectionEnum.NORTHWEST )
            {
                player1Direction = DirectionEnum.NORTH;
            }
            numberOfDirectionChangesInCurrentMovement++;

            var turnSound = game.add.audio('turn');
            turnSound.play("", 0, 0.4);
            repositionPlayerSprites();
        }
    }
}

function player1TurnLeft()
{
    if(!isGameOver && !isInMenu)
    {
        if(numberOfDirectionChangesInCurrentMovement > -2)
        {

            player1Direction--;
            if(player1Direction < DirectionEnum.NORTH)
            {
                player1Direction = DirectionEnum.NORTHWEST;
            }
            numberOfDirectionChangesInCurrentMovement--;

            var turnSound = game.add.audio('turn');
            turnSound.play("", 0, 0.4);
            repositionPlayerSprites();
        }
    }
}


function movePlayer1North()
{
    if(!isGameOver)
    {
    	if(playerTrail[0].y > 1)
    	{
    		playerTrail[0].y -= 1;
    	}
        else 
        {
            switchToGameOver();
        }
    }
}

function movePlayer1NorthEast()
{
    if(!isGameOver)
    {
        if(!(playerTrail[0].x < config.WORLD_SIZE.x))
        {
            switchToGameOver();
        }

    	if(playerTrail[0].x % 2 == 0)
    	{
    		movePlayer1North();
    	}
    	
        if(playerTrail[0].x < config.WORLD_SIZE.x)
    	{
    		playerTrail[0].x += 1;
    	}
    }
}

function movePlayer1SouthEast()
{
    if(!isGameOver)
    {
        if(!(playerTrail[0].x < config.WORLD_SIZE.x))
        {
            switchToGameOver();
        }

    	if(playerTrail[0].x % 2 == 1)
    	{
    		movePlayer1South();
    	}
    	
        if(playerTrail[0].x < config.WORLD_SIZE.x)
    	{
    		playerTrail[0].x += 1;
    	}
    }
}

function movePlayer1South()
{
    if(!isGameOver)
    {
    	if(playerTrail[0].y < config.WORLD_SIZE.y)
    	{
    		playerTrail[0].y += 1;
    	}
        else 
        {
            switchToGameOver();
        }
    }
}

function movePlayer1SouthWest()
{
    if(!isGameOver)
    {
        if(!(playerTrail[0].x >= 1))
        {
            switchToGameOver();
        }
    	if(playerTrail[0].x % 2 == 1)
    	{
    		movePlayer1South();
    	}

    	if(playerTrail[0].x >= 1)
    	{
    		playerTrail[0].x -= 1;
    	}

    }
}

function movePlayer1NorthWest()
{
    
    if(!isGameOver)
    {
        if(!(playerTrail[0].x >= 1))
        {
            switchToGameOver();
        }
    	if(playerTrail[0].x % 2 == 0)
    	{
    		movePlayer1North();
    	}

    	if(playerTrail[0].x >= 1)
    	{
    		playerTrail[0].x -= 1;
    	}
    }
}

function doPlayerMovement()
{
	if(game.time.now > movementTimer && !isGameOver && tweensFinished)
	{
		movementTimer = game.time.now + config.MOVEMENT_INCREMENT_CURRENT;
        numberOfDirectionChangesInCurrentMovement = 0;

        //var moveSound = game.add.audio('move');
        //moveSound.play("", 0, 0.35);

        for(var i = playerTrail.length - 1; i >= 1; i--)
        {
            playerTrail[i].x = playerTrail[i - 1].x;
            playerTrail[i].y = playerTrail[i - 1].y;
        }

		if(player1Direction == DirectionEnum.NORTH)
		{
			movePlayer1North();
		}
		else if(player1Direction == DirectionEnum.NORTHEAST)
		{
			movePlayer1NorthEast();
		}
		else if(player1Direction == DirectionEnum.SOUTHEAST)
		{
			movePlayer1SouthEast();
		}
		else if(player1Direction == DirectionEnum.SOUTH)
		{
			movePlayer1South();
		}
		else if(player1Direction == DirectionEnum.SOUTHWEST)
		{
			movePlayer1SouthWest();
		}
		else if(player1Direction == DirectionEnum.NORTHWEST)
		{
			movePlayer1NorthWest();
		}

        // is the head of the Snake on any of its tail poisitions?
        for(var i = 1; i < playerTrail.length; i++)
        {
            if(playerTrail[0].x == playerTrail[i].x && playerTrail[0].y == playerTrail[i].y)
            {
                switchToGameOver();
            }
        }


        repositionPlayerSprites();
	}
    else if(!tweensFinished)
    {
        repositionPlayerSprites();
    }
}

function repositionPlayerSprites()
{
    if(!isGameOver)
    {
        playerGroup.removeAll();

        // FIXME: Do not remove all but only the last one
        //playerGroup.sort('spriteIndexAsInTrail');

        for(var i = 0; i < playerTrail.length; i++)
        {
            var newCoords = getScreenPosition(playerTrail[i].x, playerTrail[i].y);
            var orientationName = "";
            if(player1Direction == DirectionEnum.NORTH)
            {
                orientationName = "playerheadN";
            }
            else if(player1Direction == DirectionEnum.SOUTH)
            {
                orientationName = "playerheadS";
            }
            else if(player1Direction == DirectionEnum.NORTHWEST)
            {
                orientationName = "playerheadNW";
            }
            else if(player1Direction == DirectionEnum.NORTHEAST)
            {
                orientationName = "playerheadNE";
            }
            else if(player1Direction == DirectionEnum.SOUTHEAST)
            {
                orientationName = "playerheadSE";
            }
            else if(player1Direction == DirectionEnum.SOUTHWEST)
            {
                orientationName = "playerheadSW";
            }
            var p = game.add.sprite(newCoords.x, newCoords.y, (i == 0 ? orientationName : 'player'));
            p.anchor.x = 0.25;
            p.anchor.y = 0;
            p.alpha = (i == 0 ? 1 : config.TRAIL_ALPHA);
            playerGroup.add(p);
        }
    }
}

function repositionItem()
{
    var itemScreenPos = getScreenPosition(itemPosition.x, itemPosition.y);
    item.x = itemScreenPos.x;
    item.y = itemScreenPos.y;
}

function getNewRandomItemPosition()
{
    itemPosition.x = game.rnd.integerInRange(1, config.WORLD_SIZE.x);
    itemPosition.y = game.rnd.integerInRange(1, config.WORLD_SIZE.y);

    playerTrail.forEach(function(val) {
        if(val.x == itemPosition.x && val.y == itemPosition.y)
        {
            getNewRandomItemPosition();
            return;
        }
    });
}

function musicMutechange()
{
    var clickSound = game.add.audio('turn');
    clickSound.play("", 0, 0.35);
    game.sound.mute = !game.sound.mute;
    particleBurstMuteButton();
    if(game.sound.mute)
    {
        muteButton.setFrames(0,1,1)   
    }
    else
    {
        
        muteButton.setFrames(1,0,0) 
    }
    
}

function getScreenPosition (tileX, tileY)
{
    var pos = [{x: 0, y: 1}];
    pos.x = tileX * (config.HEXAGON_SIZE ) + (hexagonParameters.h);

    if(tileX % 2 == 0)
    {
        pos.y = tileY  * (config.HEXAGON_SIZE) + tileY * hexagonParameters.h;
    }
    else 
    {
        pos.y = (tileY + 0.61) * (config.HEXAGON_SIZE) + tileY * hexagonParameters.h;
    }

    return pos;
}

function flashHexagons(x, y)
{
    // Flash the 6 hexagons around a certain position
    for(var i = 0; i < hexagons.length; i++)
    {
        var offset = 0;

        if(x % 2 == 0)
        {
            offset--;
        }

        if(    (hexagons[i].x == x - 1 && hexagons[i].y == y     + offset)  // Top left
            || (hexagons[i].x == x - 1 && hexagons[i].y == y + 1 + offset)  // Bottom left
            || (hexagons[i].x == x     && hexagons[i].y == y + 1         )  // Bottom
            || (hexagons[i].x == x + 1 && hexagons[i].y == y + 1 + offset)  // Bottom right
            || (hexagons[i].x == x + 1 && hexagons[i].y == y     + offset)  // Top right
            || (hexagons[i].x == x     && hexagons[i].y == y - 1         )  // Top
            || (hexagons[i].x == x     && hexagons[i].y == y             )) // Middle
        {
            hexagons[i].graphics.animations.play('ani', 18, false);
        }
    }
}

function update()
{
    if(!isInMenu)
    {
        // Is the snake head on an item?
        if(playerTrail[0].x == itemPosition.x && playerTrail[0].y == itemPosition.y)
        {
            flashHexagons(itemPosition.x, itemPosition.y);

            playerTrail.push({ x: itemPosition.x, y: itemPosition.y });
            playerItemCounter++;
            getNewRandomItemPosition();
            playerItemText.setText(config.SCORE_MULTIPLIER * playerItemCounter + ' ' + i18n[lang][1]);

            config.MOVEMENT_INCREMENT_CURRENT = config.MOVEMENT_INCREMENT_START - (config.MOVEMENT_INCREMENT_DELTA * playerItemCounter);
            if(config.MOVEMENT_INCREMENT_CURRENT <= config.MOVEMENT_INCREMENT_MIN)
            {
                config.MOVEMENT_INCREMENT_CURRENT = config.MOVEMENT_INCREMENT_MIN;
            }
            var pickupSound = game.add.audio('pickup');
            pickupSound.play("", 0, 0.25);
            particleBurstItemPickup();
        }

        if(isGameOver)
        {
            var deviceDependentRestartText ="";
            if (game.device.desktop)
            {  
                deviceDependentRestartText = i18n[lang][9];
            }
            else
            {
                deviceDependentRestartText = i18n[lang][10];
            }

            

            gameOverText.setText(i18n[lang][2] +"\n"+ deviceDependentRestartText);
        }
        doPlayerMovement();
        repositionItem();
    }
}

function resetGame()
{
    playerTween.stop();
    hexagonTween.stop();

    twitterButton.visible = false;

    playerTween = game.add.tween(playerGroup).to({ y: game.height * window.devicePixelRatio }, 1200, Phaser.Easing.Cubic.In, false);
    hexagonTween = game.add.tween(game.hexagonGroup).to({ y: game.height * window.devicePixelRatio }, 1200, Phaser.Easing.Cubic.In, false);

    playerGroup.y = 0;
    game.hexagonGroup.y = 0;

    playerTrail =
    [
        { x: 2, y: 2},
        { x: 1, y: 1}
    ];
    playerItemCounter = 0;
    config.MOVEMENT_INCREMENT_CURRENT = config.MOVEMENT_INCREMENT_START;
    playerItemText.setText(config.SCORE_MULTIPLIER * playerItemCounter + ' Points');

    isGameOver = false;
    gameOverText.setText('');

    getNewRandomItemPosition();

    player1Direction = DirectionEnum.SOUTHEAST;
}

function tweetScore()
{
    if(isGameOver)
    {
        particleBurstTwitterButton();
        window.open('https://twitter.com/intent/tweet?url=http://j.mp/1oHrlCm&text=I%27ve%20just%20reached%20$score$%20on%20%23HexagonSnake'.replace('$score$', config.SCORE_MULTIPLIER * playerItemCounter + ' Points'));
    }
}

window.onload = function ()
{
    game = new Phaser.Game(
        480,
        800,
        Phaser.AUTO,
        '',
        {
            preload: preload,
            create: create,
            update: update
        }
    );
}