var config =
{
    HEXAGON_SIZE: 50,
    WORLD_SIZE:
    {
        x: 15,
        y: 9
    },
    INPUT_INCREMENT: 50,
    MOVEMENT_INCREMENT: 500
};

var game;
var player;
var item;
var playerTrail = [{x: 0, y: 1}];

var cursors;

var inputTimer = 0;
var movementTimer = 0;

var hexagonParameters = {};
var hexagons = [];

var itemPosition = {x:0, y:1};

var playerItemCounter = 0;
var playerItemText;

var music;


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
    game.load.image('item', 'Assets/GFX/item.png');

    game.load.audio('music', ['Assets/Audio/music.ogg', 'Assets/Audio/music.mp3']);
}

function create()
{
    // Set hexagon parameters
    hexagonParameters.size = config.HEXAGON_SIZE;
    hexagonParameters.s = config.HEXAGON_SIZE / 2.0;
    hexagonParameters.h = config.HEXAGON_SIZE / 4.0;
    hexagonParameters.r = config.HEXAGON_SIZE / 2;

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

    cursors.m = game.input.keyboard.addKey(Phaser.Keyboard.M);
    cursors.m.onDown.add(MusicMutechange,this);

    item = game.add.sprite(0,0,'item');
    item.anchor.x = 0.5;
    item.anchor.y = 0.5;
    repositionItem();
    
    music = game.add.audio('music');
    music.play('', 0, 1, true);

	inputTimer = 0;

    text = game.add.text(10, 15, "0 Points", {
        font: "20px Arial",
        fill: "#ffffff",
        align: "left"
    });


}

function Player1TurnRight()
{
    player1Direction++;
     if(player1Direction > DirectionEnum.NORTHWEST)
     {
         player1Direction = DirectionEnum.NORTH;
     }
}
function Player1TurnLeft()
{
    player1Direction++;
     if(player1Direction > DirectionEnum.NORTHWEST)
     {
         player1Direction = DirectionEnum.NORTH;
     }
}
function Player1TurnLeft()
{
    player1Direction--;
    if(player1Direction < DirectionEnum.NORTH)
    {
        player1Direction = DirectionEnum.NORTHWEST;
    }
}

function getInput()
{
 	if(game.time.now >inputTimer)
 	{
 		inputTimer = game.time.now + config.INPUT_INCREMENT;
	    if (cursors.right.isDown)
	    {
	    	//Player1TurnRight();
	    }
		else if (cursors.left.isDown)
	    {
            //Player1TurnLeft();
	    	
	    }
	    console.log(player1Direction);
	}
}


function MovePlayer1North()
{
	if(playerTrail[0].y > 1)
	{
		playerTrail[0].y -= 1;
	}
}

function MovePlayer1NorthEast()
{
	if(playerTrail[0].x % 2 == 0)
	{
		MovePlayer1North();
	}
	
    if(playerTrail[0].x < config.WORLD_SIZE.x)
	{
		playerTrail[0].x += 1;
	}
}

function MovePlayer1SouthEast()
{
	if(playerTrail[0].x % 2 == 1)
	{
		MovePlayer1South();
	}
	
    if(playerTrail[0].x < config.WORLD_SIZE.x)
	{
		playerTrail[0].x += 1;
	}
}

function MovePlayer1South()
{
	if(playerTrail[0].y < config.WORLD_SIZE.y)
	{
		playerTrail[0].y += 1;
	}
}

function MovePlayer1SouthWest()
{
	if(playerTrail[0].x % 2 == 1)
	{
		MovePlayer1South();
	}

	if(playerTrail[0].x >= 1)
	{
		playerTrail[0].x -= 1;
	}
}

function MovePlayer1NorthWest()
{
	if(playerTrail[0].x % 2 == 0)
	{
		MovePlayer1North();
	}

	if(playerTrail[0].x >= 1)
	{
		playerTrail[0].x -= 1;
	}
}

function DoPlayerMovement()
{
	if(game.time.now > movementTimer)
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

}


function repositionItem()
{
    itemPosition.x = game.rnd.integerInRange(0, config.WORLD_SIZE.x);
    itemPosition.y = game.rnd.integerInRange(0, config.WORLD_SIZE.y);

    item.x = itemPosition.x * (config.HEXAGON_SIZE ) + (hexagonParameters.h);
    if(itemPosition.x %2 == 0)
    {
        item.y = itemPosition.y  * (config.HEXAGON_SIZE) + itemPosition.y * hexagonParameters.h;
    }
    else
    {
        item.y = (itemPosition.y + 0.61) * (config.HEXAGON_SIZE+1) + itemPosition.y * hexagonParameters.h;
    }
}

function MusicMutechange()
{
    game.sound.mute = !game.sound.mute;
}

function update()
{
	player.x = playerTrail[0].x * (config.HEXAGON_SIZE ) + (hexagonParameters.h);

	if(playerTrail[0].x % 2 == 0)
	{
		player.y = playerTrail[0].y  * (config.HEXAGON_SIZE) + playerTrail[0].y * hexagonParameters.h;
	}
	else 
	{
		player.y = (playerTrail[0].y + 0.61) * (config.HEXAGON_SIZE+1) + playerTrail[0].y * hexagonParameters.h;
	}


    if(playerTrail[0].x == itemPosition.x && playerTrail[0].y == itemPosition.y)
    {
        playerItemCounter++;
        repositionItem();
        text.setText( 250*playerItemCounter + " Points" );
    }

	getInput();
	DoPlayerMovement();
}

window.onload = function ()
{
    game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
}