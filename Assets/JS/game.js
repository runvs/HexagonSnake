var config =
{
    HEXAGON_SIZE: 50,
    WORLD_SIZE:
    {
        x: 14,
        y: 8
    },
    INPUT_INCREMENT: 50,
    MOVEMENT_INCREMENT: 500,
    globalScreenOffsetY: 0
};

var game;
var player;
var item;
var playerTrail = [{x: 0, y: 1}];

var TouchInput;

var cursors;

var inputTimer = 0;
var movementTimer = 0;

var hexagonParameters = {};
var hexagons = [];

var itemPosition = {x:0, y:1};

var playerItemCounter = 0;
var playerItemText;

var music;

var tileBlocked;

var IsGameOver;
var GameOverText;


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
    game.load.image('tileBlocked', 'Assets/GFX/tileBlocked.png');
    game.load.image('item', 'Assets/GFX/item.png');

    game.load.audio('music', ['Assets/Audio/music.ogg', 'Assets/Audio/music.mp3']);
}

function create()
{
    IsGameOver = false;
    globalScreenOffsetY = 0;

    // Set hexagon parameters
    hexagonParameters.size = config.HEXAGON_SIZE;
    hexagonParameters.s = config.HEXAGON_SIZE / 2.0;
    hexagonParameters.h = config.HEXAGON_SIZE / 4.0;
    hexagonParameters.r = config.HEXAGON_SIZE / 2;

    game.hexagonGroup = game.add.group();

	for (var i = 0; i < config.WORLD_SIZE.x + 1; i++) 
	{
		for (var j = 1; j < config.WORLD_SIZE.y + 1; j++) 
		{
			hexagons.push(new Hexagon(i, j, game, hexagonParameters, 'tile'));
		}
	}

	player = game.add.sprite(0, 0, 'player');
	player.anchor.x = 0.5;
    player.anchor.y = 0.5;

	cursors = game.input.keyboard.createCursorKeys();
    cursors.right.onDown.add(Player1TurnRight, this);
    cursors.left.onDown.add(Player1TurnLeft, this);
    
    game.input.onDown.add(DoTouchInput, this);

    playerTrail[0].x = config.WORLD_SIZE.x/2;
    playerTrail[0].y = config.WORLD_SIZE.y/2;
    player1Direction = DirectionEnum.SOUTH;

    cursors.m = game.input.keyboard.addKey(Phaser.Keyboard.M);
    cursors.m.onDown.add(MusicMutechange,this);

    item = game.add.sprite(0,0,'item');
    item.anchor.x = 0.5;
    item.anchor.y = 0.5;
    GetNewRandomItemPosition();



    tileBlocked = game.add.sprite(0,0, "tileBlocked");
    
    music = game.add.audio('music');
    music.play('', 0, 1, true);

	inputTimer = 0;

    playerItemText = game.add.text(10, 15, "0 Points", {
        font: "20px Arial",
        fill: " #6088ff",
        align: "left"
    });

    GameOverText = game.add.text(game.width/2. - 75, game.height/2., "Game Over", {
        font: "25px Arial",
        fill: " #ff8860",
        align: "right"
    });
    GameOverText.setText("");
}


function SwitchToGameOver()
{
    IsGameOver = true;
    game.add.tween(config).to({globalScreenOffsetY : 1000}, 3200, Phaser.Easing.Cubic.In, true);
    game.add.tween(game.hexagonGroup).to({y : 1000}, 3200, Phaser.Easing.Cubic.In, true);
}

function DoTouchInput(pointer)
{
    if( pointer.x < game.width/2)
    {
        Player1TurnLeft();
    }
    else
    {
        Player1TurnRight();
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
		movementTimer  = game.time.now + config.MOVEMENT_INCREMENT;
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
	}
    repositionPlayer();

}

function repositionPlayer()
{
    var playerScreenPosition = getScreenPosition(playerTrail[0].x, playerTrail[0].y);
    player.x = playerScreenPosition.x;
    player.y = playerScreenPosition.y + config.globalScreenOffsetY;
    //console.log(config.globalScreenOffsetY);
}

function repositionItem()
{
    var itemScreenPos =getScreenPosition(itemPosition.x, itemPosition.y);
    item.x = itemScreenPos.x;
    item.y = itemScreenPos.y + config.globalScreenOffsetY;
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
        pos.y = (tileY + 0.61) * (config.HEXAGON_SIZE+1) + tileY * hexagonParameters.h;
    }

    return pos;
}

function update()
{

    if(playerTrail[0].x == itemPosition.x && playerTrail[0].y == itemPosition.y)
    {
        playerItemCounter++;
        GetNewRandomItemPosition();
        playerItemText.setText( 225*playerItemCounter + " Points" );
    }
	
    //console.log(game.hexagonGroup.y);
    if(IsGameOver)
    {
        GameOverText.setText("Game Over");
    }
    DoPlayerMovement();
    repositionItem();
}

window.onload = function ()
{
    game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
}