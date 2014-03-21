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
};

var game;
var item;
var player;
var playerTrail = [{x: 0, y: 1}, {x: 0, y: 1}];

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
	game.load.image('player', 'Assets/GFX/player.png');
    game.load.image('tile', 'Assets/GFX/tile.png');
    game.load.spritesheet('item', 'Assets/GFX/tileBlocked.png', 51, 45);

    game.load.audio('music', ['Assets/Audio/music.ogg', 'Assets/Audio/music.mp3']);
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
    hexagonParameters.r = config.HEXAGON_SIZE / 2;

    game.hexagonGroup = game.add.group();

    player = game.add.group();

	cursors = game.input.keyboard.createCursorKeys();
    cursors.right.onDown.add(Player1TurnRight, this);
    cursors.left.onDown.add(Player1TurnLeft, this);
    
    game.input.onDown.add(DoTouchInput, this);

    cursors.m = game.input.keyboard.addKey(Phaser.Keyboard.M);
    cursors.m.onDown.add(MusicMutechange, this);

    cursors.r = game.input.keyboard.addKey(Phaser.Keyboard.R);
    cursors.r.onDown.add(resetGame, this);
    cursors.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    cursors.space.onDown.add(SwitchIntoGame, this);

    item = game.add.sprite(0, 0, 'item');
    item.anchor.x = 0.25;
    item.anchor.y = 0;
    item.animations.add('ani');
    item.animations.play('ani', 8, true);
    item.alpha = 0;
    GetNewRandomItemPosition();

    inputTimer = 0;

    playerTrail[0].x = config.WORLD_SIZE.x/2;
    playerTrail[0].y = config.WORLD_SIZE.y/2;
    playerTrail[1].x = config.WORLD_SIZE.x/2;
    playerTrail[1].y = config.WORLD_SIZE.y/2 - 1;
    player1Direction = DirectionEnum.SOUTH;

    music = game.add.audio('music');
    music.play('', 0, 1, true);

    playerTween = game.add.tween(player).to({y : 1000}, 3200, Phaser.Easing.Cubic.In, false);
    hexagonTween = game.add.tween(game.hexagonGroup).to({y : 1000}, 3200, Phaser.Easing.Cubic.In, false);

    playerItemText = game.add.text(10, 15, "0 Points", {
        font: "20px Arial",
        fill: " #6088ff",
        align: "left"
    });
    playerItemText.setText("");

    GameOverText = game.add.text(game.width/2. - 75, game.height/2., "Game Over", {
        font: "25px Arial",
        fill: " #ff8860",
        align: "right"
    });
    GameOverText.setText("");
    
    MenuTextGameName = game.add.text(25, 15, "Hexagon Snake", {
        font: "45px Arial",
        fill: " #ff8860",
        align: "center"
    });

    MenuTextInfo = game.add.text(25, 65, "Tap/Press Space to Start", {
        font: "25px Arial",
        fill: " #ff8860",
        align: 'center'
    });


    MenuTextCredits = game.add.text(25, 390, "Created By \nJulian Dinges @Thunraz\nSimon Weis @Laguna_999", {
        font: "15px Arial",
        fill: " #ff8860",
        align: 'left'
    });


}


function SwitchToGameOver()
{
    IsGameOver = true;

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
        player.removeAll();
        for(var i = 0; i < playerTrail.length; i++)
        {
            var newCoords = getScreenPosition(playerTrail[i].x, playerTrail[i].y);
            var p = game.add.sprite(newCoords.x, newCoords.y, 'player');
            p.anchor.x = 0.25;
            p.anchor.y = 0;
            p.alpha = (i == 0 ? 1 : 0.6);
            player.add(p);
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
            playerItemText.setText(225 * playerItemCounter + ' Points');

            config.MOVEMENT_INCREMENT = 500 - (6*playerItemCounter);
            if(config.MOVEMENT_INCREMENT <= 100)
            {
                config.MOVEMENT_INCREMENT = 100;
            }
        }

        if(IsGameOver)
        {
            GameOverText.setText("Game Over");
        }
        DoPlayerMovement();
        repositionItem();
    }
}

function resetGame()
{
    playerTween.stop();
    hexagonTween.stop();

    player.y = 0;
    game.hexagonGroup.y = 0;

    playerTrail =
    [
        { x: config.WORLD_SIZE.x / 2, y: config.WORLD_SIZE.y / 2},
        { x: config.WORLD_SIZE.x / 2, y: config.WORLD_SIZE.y / 2 - 1}
    ];
    playerItemCounter = 0;
    playerItemText.setText(225 * playerItemCounter + ' Points');

    IsGameOver = false;
    GameOverText.setText('');

    GetNewRandomItemPosition();

    player1Direction = DirectionEnum.SOUTH;
}

window.onload = function ()
{
    game = new Phaser.Game(800, 480, Phaser.AUTO, '', { preload: preload, create: create, update: update });
}