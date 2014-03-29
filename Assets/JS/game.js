var config =
{
    HEXAGON_SIZE: 50,
    WORLD_SIZE:
    {
        x: 8,
        y: 10
    },
    INPUT_INCREMENT: 50,
    MOVEMENT_INCREMENT: 500,
    SCORE_MULTIPLIER: 225,
    PARTICLEFADEOUTTIME: 500,
    PARTICLENUMBER:15,
    PARTICLESPEEDRANGE:150
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

var tweensFinished = false;

var numberOfDirectionChangesInCurrentMovement = 0;

var lang = navigator.language.substr(0, 2);

DirectionEnum = {
    NORTH     : 0,
    NORTHEAST : 1,
    SOUTHEAST : 2,
    SOUTH     : 3,
    SOUTHWEST : 4,
    NORTHWEST : 5
}

var player1Direction = DirectionEnum.NORTHWEST;

function preload()
{
	game.load.image('player', 'Assets/GFX/Player.png');
    game.load.image('tile', 'Assets/GFX/tile.png');
    game.load.spritesheet('item', 'Assets/GFX/tileBlocked.png', 51, 45);

    game.load.audio('music', ['Assets/Audio/music.ogg', 'Assets/Audio/music.mp3']);
    game.load.audio('pickup', ['Assets/Audio/pickup.ogg', 'Assets/Audio/pickup.mp3']);
    game.load.audio('fail', ['Assets/Audio/fail.ogg', 'Assets/Audio/fail.mp3']);
}

function create()
{
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

    playerTrail[0].x = 2;
    playerTrail[0].y = 2;
    playerTrail[1].x = 1;
    playerTrail[1].y = 1;
    player1Direction = DirectionEnum.SOUTHEAST;

    music = game.add.audio('music');
    music.play('', 0, 1, true);

    particleEmitterItemPickup = game.add.emitter(0, 0, 100);
    particleEmitterItemPickup.makeParticles('item');  
    particleEmitterItemPickup.alpha = 1;
    particleEmitterItemPickup.maxParticleScale= 0.5;
    particleEmitterItemPickup.minParticleScale = 0.25;
    particleEmitterItemPickup.minParticleSpeed.setTo(-config.PARTICLESPEEDRANGE, -config.PARTICLESPEEDRANGE);
    particleEmitterItemPickup.maxParticleSpeed.setTo(config.PARTICLESPEEDRANGE, config.PARTICLESPEEDRANGE);
    particleEmitterItemPickup.gravity = 200;


    game.hexagonGroup.y = playerGroup.y = game.height * -window.devicePixelRatio;

    playerTween = game.add.tween(playerGroup).to({ y: game.height * window.devicePixelRatio }, 1200, Phaser.Easing.Cubic.In, false);
    hexagonTween = game.add.tween(game.hexagonGroup).to({ y: game.height * window.devicePixelRatio }, 1200, Phaser.Easing.Cubic.In, false);
    playerStartTween = game.add.tween(playerGroup).to({ y: 0 }, 2000, Phaser.Easing.Bounce.Out, false);
    hexagonStartTween = game.add.tween(game.hexagonGroup).to({ y: 0 }, 2000, Phaser.Easing.Bounce.Out, false);
    playerStartTween.onComplete.add(function() {
        tweensFinished = true;
    }, this);

  

    createText();


    
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


    menuTextGameName = game.add.text(textLeftMargin, textTopMargin, i18n[lang][0], {
        font: "45px Arial",
        fill: " #ff8860",
        align: "left"
    });
    menuTextGameName.anchor.setTo(0,0.5);

    menuTextCredits = game.add.text(textLeftMargin, game.height - textTopMargin, i18n[lang][11], {
        font: "15px Arial",
        fill: " #ff8860",
        align: 'left'
    });
    menuTextCredits.anchor.setTo(0,1);


    // plattform dependent text
    if (game.device.desktop)
    {
        menuTextInfo = game.add.text(textLeftMargin, 65, i18n[lang][3], {
            font: "25px Arial",
            fill: " #ff8860",
            align: 'left'
        });
        menuTextInfo.anchor.setTo(0,0.5);

        menuTextTutorial1 = game.add.text(textLeftMargin, game.height/2 - 25, i18n[lang][5], {
            font: "25px Arial",
            fill: " #ff8860",
            align: 'left'
        });
        menuTextTutorial1.anchor.setTo(0,0.5);

        menuTextTutorial2 = game.add.text(game.width - textLeftMargin, game.height/2 + 25, i18n[lang][7], {
            font: "25px Arial",
            fill: " #ff8860",
            align: 'left'
        });
        menuTextTutorial2.anchor.setTo(1,0.5);

     
    }
    else    // on mobile devices
    {
        menuTextInfo = game.add.text(textLeftMargin, 65, i18n[lang][4], {
            font: "25px Arial",
            fill: " #ff8860",
            align: 'left'
        });
        menuTextInfo.anchor.setTo(0,0.5);

        menuTextTutorial1 = game.add.text(textLeftMargin, game.height/2 - 25,  i18n[lang][6], {
            font: "25px Arial",
            fill: " #ff8860",
            align: 'left'
        });
        menuTextTutorial1.anchor.setTo(0,0.5);

        menuTextTutorial2 = game.add.text(game.width - textLeftMargin, game.height/2 + 25, i18n[lang][8], {
            font: "25px Arial",
            fill: " #ff8860",
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



function switchToGameOver()
{
    isGameOver = true;

    var failSound = game.add.audio('fail');
    failSound.play("", 0, 0.125);
    playerTween.start();
    hexagonTween.start();
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
        if( pointer.x < game.width/2)
        {
            player1TurnLeft();
        }
        else
        {
            player1TurnRight();
        }
        if(isGameOver)
        {
            resetGame();
        }
    }
    else
    {
        switchIntoGame();
    }
}


function player1TurnRight()
{
    if(!isGameOver)
    {
        if(numberOfDirectionChangesInCurrentMovement < 2)
        {
            player1Direction++;
            if(player1Direction > DirectionEnum.NORTHWEST )
            {
                player1Direction = DirectionEnum.NORTH;
            }
            numberOfDirectionChangesInCurrentMovement++;
        }
    }
}

function player1TurnLeft()
{
    if(!isGameOver)
    {
        if(numberOfDirectionChangesInCurrentMovement > -2)
        {
            player1Direction--;
            if(player1Direction < DirectionEnum.NORTH)
            {
                player1Direction = DirectionEnum.NORTHWEST;
            }
            numberOfDirectionChangesInCurrentMovement--;
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
		movementTimer = game.time.now + config.MOVEMENT_INCREMENT;
        numberOfDirectionChangesInCurrentMovement = 0;

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
        for(var i = 0; i < playerTrail.length; i++)
        {
            var newCoords = getScreenPosition(playerTrail[i].x, playerTrail[i].y);
            var p = game.add.sprite(newCoords.x, newCoords.y, 'player');
            p.anchor.x = 0.25;
            p.anchor.y = 0;
            p.alpha = (i == 0 ? 1 : 0.6);
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
    game.sound.mute = !game.sound.mute;
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

function update()
{
    if(!isInMenu)
    {
        // Is the snake head on an item?
        if(playerTrail[0].x == itemPosition.x && playerTrail[0].y == itemPosition.y)
        {
            playerTrail.push({ x: itemPosition.x, y: itemPosition.y });
            playerItemCounter++;
            getNewRandomItemPosition();
            playerItemText.setText(config.SCORE_MULTIPLIER * playerItemCounter + ' ' + i18n[lang][1]);

            config.MOVEMENT_INCREMENT = 500 - (6 * playerItemCounter);
            if(config.MOVEMENT_INCREMENT <= 100)
            {
                config.MOVEMENT_INCREMENT = 100;
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
    config.MOVEMENT_INCREMENT = 500;
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
        window.open('https://twitter.com/intent/tweet?url=http://j.mp/1oHrlCm&text=I%27ve%20just%20reached%20$score$%20on%20%23HexagonSnake'.replace('$score$', config.SCORE_MULTIPLIER * playerItemCounter + ' Points'));
    }
}

window.onload = function ()
{
    game = new Phaser.Game(
        //window.innerWidth * window.devicePixelRatio,
        //window.innerHeight * window.devicePixelRatio,
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