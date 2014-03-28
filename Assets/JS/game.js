var config =
{
    HEXAGON_SIZE: 50,
    WORLD_SIZE:
    {
        x: 14,
        y: 6
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

var particleEmitter;

var TouchInput;

var cursors;

var inputTimer = 0;
var movementTimer = 0;

var hexagonParameters = {};
var hexagons = [];

var itemPosition = {x : 0, y : 1};

var playerItemCounter = 0;
var playerItemText;

var music;

var IsInMenu;
var MenuTextGameName;
var MenuTextInfo;
var MenuTextCredits;

var IsGameOver;
var GameOverText;

var playerTween;
var hexagonTween;
var playerStartTween;
var hexagonStartTween;

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

    IsInMenu = true;
    IsGameOver = false;

    game.stage.backgroundColor = "#030710";
    // Set hexagon parameters
    hexagonParameters.size = config.HEXAGON_SIZE;
    hexagonParameters.s = config.HEXAGON_SIZE / 2.0;
    hexagonParameters.h = config.HEXAGON_SIZE / 4.0;
    hexagonParameters.r = config.HEXAGON_SIZE / 2.0;

    game.hexagonGroup = game.add.group();

    playerGroup = game.add.group();

	cursors = game.input.keyboard.createCursorKeys();
    cursors.right.onDown.add(Player1TurnRight, this);
    cursors.left.onDown.add(Player1TurnLeft, this);

    cursors.a = game.input.keyboard.addKey(Phaser.Keyboard.A);
    cursors.a.onDown.add(Player1TurnLeft,this);

    cursors.d = game.input.keyboard.addKey(Phaser.Keyboard.D);
    cursors.d.onDown.add(Player1TurnRight,this);    
    
    game.input.onDown.add(DoTouchInput, this);

    cursors.m = game.input.keyboard.addKey(Phaser.Keyboard.M);
    cursors.m.onDown.add(MusicMutechange, this);

    cursors.r = game.input.keyboard.addKey(Phaser.Keyboard.R);
    cursors.r.onDown.add(resetGame, this);
    
    cursors.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    cursors.space.onDown.add(SwitchIntoGame, this);

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
    GetNewRandomItemPosition();

    inputTimer = 0;

    playerTrail[0].x = 2;
    playerTrail[0].y = 2;
    playerTrail[1].x = 1;
    playerTrail[1].y = 1;
    player1Direction = DirectionEnum.SOUTHEAST;

    music = game.add.audio('music');
    music.play('', 0, 1, true);

    particleEmitter = game.add.emitter(0, 0, 100);
    particleEmitter.makeParticles('item');  
    
    particleEmitter.alpha = 0.5;

    particleEmitter.maxParticleScale= 0.5;
    particleEmitter.minParticleScale = 0.25;

    particleEmitter.minParticleSpeed.setTo(-config.PARTICLESPEEDRANGE, -config.PARTICLESPEEDRANGE);
    particleEmitter.maxParticleSpeed.setTo(config.PARTICLESPEEDRANGE, config.PARTICLESPEEDRANGE);



    particleEmitter.gravity = 200;

    game.hexagonGroup.y = playerGroup.y = window.innerHeight * -window.devicePixelRatio;

    playerTween = game.add.tween(playerGroup).to({ y: window.innerHeight * window.devicePixelRatio }, 3200, Phaser.Easing.Cubic.In, false);
    hexagonTween = game.add.tween(game.hexagonGroup).to({ y: window.innerHeight * window.devicePixelRatio }, 3200, Phaser.Easing.Cubic.In, false);
    playerStartTween = game.add.tween(playerGroup).to({ y: 0 }, 1000, Phaser.Easing.Cubic.Out, false);
    hexagonStartTween = game.add.tween(game.hexagonGroup).to({ y: 0 }, 1000, Phaser.Easing.Cubic.Out, false);

    playerItemText = game.add.text(10, 15, "0 Points", {
        font: "20px Arial",
        fill: " #6088ff",
        align: "left"
    });
    playerItemText.setText("");

    GameOverText = game.add.text(game.width / 2, game.height / 2, "Game Over", {
        font: "25px Arial",
        fill: " #ff8860",
        align: "center"
    });
    GameOverText.setText("");
    GameOverText.anchor.setTo(0.5, 0.5);
    
    MenuTextGameName = game.add.text(25, 15, "Hexagon Snake", {
        font: "45px Arial",
        fill: " #ff8860",
        align: "left"
    });

    MenuTextInfo = game.add.text(25, 65, "Tap/Press Space to Start\nPress F to go fullscreen", {
        font: "25px Arial",
        fill: " #ff8860",
        align: 'left'
    });

    MenuTextCredits = game.add.text(25, 390, "Created By \nJulian Dinges @Thunraz\nSimon Weis @Laguna_999", {
        font: "15px Arial",
        fill: " #ff8860",
        align: 'left'
    });
}


function particleBurst() {

    //  Position the emitter where the mouse/touch event was
    var pos =  getScreenPosition(playerTrail[0].x, playerTrail[0].y);
    particleEmitter.x = pos.x + hexagonParameters.h;
    particleEmitter.y = pos.y + hexagonParameters.s;

    //  The first parameter sets the effect to "explode" which means all particles are emitted at once
    //  The second gives each particle a 2000ms lifespan
    //  The third is ignored when using burst/explode mode
    //  The final parameter (10) is how many particles will be emitted in this single burst
    particleEmitter.start(true, config.PARTICLEFADEOUTTIME, null, config.PARTICLENUMBER);

    var particleAlphaTween = game.add.tween(particleEmitter).to({ alpha: 0 }, config.PARTICLEFADEOUTTIME, Phaser.Easing.Linear.Out, true);
    particleAlphaTween.onComplete.add(function (){particleEmitter.alpha = 1;} , this);

}

function SwitchToGameOver()
{
    IsGameOver = true;

    var failSound = game.add.audio('fail');
    failSound.play("", 0, 0.125);
    playerTween.start();
    hexagonTween.start();
}

function SwitchIntoGame()
{
    if(IsInMenu)
    {
        playerItemText.setText("0 Points");
        MenuTextGameName.setText("");
        MenuTextInfo.setText("");
        MenuTextCredits.setText("");

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

        GetNewRandomItemPosition();
        game.hexagonGroup.add(item);
        IsInMenu = false;
    }
    else
    {
        if(IsGameOver)
        {
            resetGame();
        }
    }
}

function DoTouchInput(pointer)
{
    if(!IsInMenu)
    {
        if( pointer.x < game.width/2)
        {
            Player1TurnLeft();
        }
        else
        {
            Player1TurnRight();
        }
        if(IsGameOver)
        {
            resetGame();
        }
    }
    else
    {
        SwitchIntoGame();
    }
}


function Player1TurnRight()
{
    if(!IsGameOver)
    {
        player1Direction++;
        if(player1Direction > DirectionEnum.NORTHWEST )
        {
            player1Direction = DirectionEnum.NORTH;
        }
    }
}

function Player1TurnLeft()
{
    if(!IsGameOver)
    {
        player1Direction--;
        if(player1Direction < DirectionEnum.NORTH)
        {
            player1Direction = DirectionEnum.NORTHWEST;
        }
    }
}


function MovePlayer1North()
{
    if(!IsGameOver)
    {
    	if(playerTrail[0].y > 1)
    	{
    		playerTrail[0].y -= 1;
    	}
        else 
        {
            SwitchToGameOver();
        }
    }
}

function MovePlayer1NorthEast()
{
    if(!IsGameOver)
    {
        if(!(playerTrail[0].x < config.WORLD_SIZE.x))
        {
            SwitchToGameOver();
        }

    	if(playerTrail[0].x % 2 == 0)
    	{
    		MovePlayer1North();
    	}
    	
        if(playerTrail[0].x < config.WORLD_SIZE.x)
    	{
    		playerTrail[0].x += 1;
    	}
    }
}

function MovePlayer1SouthEast()
{
    if(!IsGameOver)
    {
        if(!(playerTrail[0].x < config.WORLD_SIZE.x))
        {
            SwitchToGameOver();
        }

    	if(playerTrail[0].x % 2 == 1)
    	{
    		MovePlayer1South();
    	}
    	
        if(playerTrail[0].x < config.WORLD_SIZE.x)
    	{
    		playerTrail[0].x += 1;
    	}
    }
}

function MovePlayer1South()
{
    if(!IsGameOver)
    {
    	if(playerTrail[0].y < config.WORLD_SIZE.y)
    	{
    		playerTrail[0].y += 1;
    	}
        else 
        {
            SwitchToGameOver();
        }
    }
}

function MovePlayer1SouthWest()
{
    if(!IsGameOver)
    {
        if(!(playerTrail[0].x >= 1))
        {
            SwitchToGameOver();
        }
    	if(playerTrail[0].x % 2 == 1)
    	{
    		MovePlayer1South();
    	}

    	if(playerTrail[0].x >= 1)
    	{
    		playerTrail[0].x -= 1;
    	}

    }
}

function MovePlayer1NorthWest()
{
    
    if(!IsGameOver)
    {
        if(!(playerTrail[0].x >= 1))
        {
            SwitchToGameOver();
        }
    	if(playerTrail[0].x % 2 == 0)
    	{
    		MovePlayer1North();
    	}

    	if(playerTrail[0].x >= 1)
    	{
    		playerTrail[0].x -= 1;
    	}
    }
}

function DoPlayerMovement()
{
	if(game.time.now > movementTimer && !IsGameOver)
	{
		movementTimer = game.time.now + config.MOVEMENT_INCREMENT;

        for(var i = playerTrail.length - 1; i >= 1; i--)
        {
            playerTrail[i].x = playerTrail[i - 1].x;
            playerTrail[i].y = playerTrail[i - 1].y;
        }

		if(player1Direction == DirectionEnum.NORTH)
		{
			MovePlayer1North();
		}
		else if(player1Direction == DirectionEnum.NORTHEAST)
		{
			MovePlayer1NorthEast();
		}
		else if(player1Direction == DirectionEnum.SOUTHEAST)
		{
			MovePlayer1SouthEast();
		}
		else if(player1Direction == DirectionEnum.SOUTH)
		{
			MovePlayer1South();
		}
		else if(player1Direction == DirectionEnum.SOUTHWEST)
		{
			MovePlayer1SouthWest();
		}
		else if(player1Direction == DirectionEnum.NORTHWEST)
		{
			MovePlayer1NorthWest();
		}

        // is the head of the Snake on any of its tail poisitions?
        for(var i = 1; i < playerTrail.length; i++)
        {
            if(playerTrail[0].x == playerTrail[i].x && playerTrail[0].y == playerTrail[i].y)
            {
                SwitchToGameOver();
            }
        }


        repositionPlayerSprites();
	}
}

function repositionPlayerSprites()
{
    if(!IsGameOver)
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

function GetNewRandomItemPosition()
{
    itemPosition.x = game.rnd.integerInRange(1, config.WORLD_SIZE.x);
    itemPosition.y = game.rnd.integerInRange(1, config.WORLD_SIZE.y);

    playerTrail.forEach(function(val) {
        if(val.x == itemPosition.x && val.y == itemPosition.y)
        {
            GetNewRandomItemPosition();
            return;
        }
    });
}

function MusicMutechange()
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
    if(!IsInMenu)
    {
        // Is the snake head on an item?
        if(playerTrail[0].x == itemPosition.x && playerTrail[0].y == itemPosition.y)
        {
            playerTrail.push({ x: itemPosition.x, y: itemPosition.y });
            playerItemCounter++;
            GetNewRandomItemPosition();
            playerItemText.setText(config.SCORE_MULTIPLIER * playerItemCounter + ' Points');

            config.MOVEMENT_INCREMENT = 500 - (6 * playerItemCounter);
            if(config.MOVEMENT_INCREMENT <= 100)
            {
                config.MOVEMENT_INCREMENT = 100;
            }
            var pickupSound = game.add.audio('pickup');
            pickupSound.play("", 0, 0.25);
            particleBurst();
        }

        if(IsGameOver)
        {
            GameOverText.setText("Game Over\nTap/Press Space\nPress t to tweet your score!");
        }
        DoPlayerMovement();
        repositionItem();
    }
}

function resetGame()
{
    playerTween.stop();
    hexagonTween.stop();

    playerTween = game.add.tween(playerGroup).to({ y: window.innerHeight * window.devicePixelRatio }, 3200, Phaser.Easing.Cubic.In, false);
    hexagonTween = game.add.tween(game.hexagonGroup).to({ y: window.innerHeight * window.devicePixelRatio }, 3200, Phaser.Easing.Cubic.In, false);

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

    IsGameOver = false;
    GameOverText.setText('');

    GetNewRandomItemPosition();

    player1Direction = DirectionEnum.SOUTHEAST;
}

function tweetScore()
{
    if(IsGameOver)
    {
        window.open('https://twitter.com/intent/tweet?url=http://j.mp/1oHrlCm&text=I%27ve%20just%20reached%20$score$%20on%20%23HexagonSnake'.replace('$score$', config.SCORE_MULTIPLIER * playerItemCounter + ' Points'));
    }
}

window.onload = function ()
{
    game = new Phaser.Game(
        //window.innerWidth * window.devicePixelRatio,
        //window.innerHeight * window.devicePixelRatio,
        800,
        480,
        Phaser.AUTO,
        '',
        {
            preload: preload,
            create: create,
            update: update
        }
    );
}