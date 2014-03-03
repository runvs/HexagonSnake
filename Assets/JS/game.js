var config =
{
    HEXAGON_SIZE: 50,
    WORLD_SIZE:
    {
        x: 15,
        y: 9
    },
    INPUT_INCREMENT: 250
};

var game;
var player;
var playerTrail = [{x: 0, y: 1}];

var cursors;

var inputTimer = 0;
var movementTimer = 0;


var hexagonParameters = {};
var hexagons = [];

DirectionEnum = {
    NORTH : 0,
    NORTHEAST : 1,
    SOUTEAST : 2,
    SOUTH : 3,
    SOUTHWEST :4,
    NORTHWEST : 5
}

var player1Direction = DirectionEnum.NORTHWEST;

function preload()
{
	game.load.image('player', 'Assets/GFX/player.png');
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
			hexagons.push(new Hexagon(i, j, game, hexagonParameters));
		}
	}

	player = game.add.sprite(0, 0, 'player');
	player.anchor.x = 0.5;
    player.anchor.y = 0.5;
	cursors = game.input.keyboard.createCursorKeys();
	inputTimer = 0;
}

function getInput()
{
 	if(game.time.now >inputTimer)
 	{
 		inputTimer = game.time.now + config.INPUT_INCREMENT;
	    if (cursors.right.isDown)
	    {
	    	player1Direction++;
	    	if(player1Direction > DirectionEnum.NORTHWEST)
	    	{
	    		player1Direction = DirectionEnum.NORTH;
	    	}
	    }
		else if (cursors.left.isDown)
	    {
	    	player1Direction--;
	    	if(player1Direction < DirectionEnum.NORTH)
	    	{
	    		player1Direction = DirectionEnum.NORTHWEST;
	    	}
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
		movementTimer  = game.time.now + 500;
		if(player1Direction == DirectionEnum.NORTH)
		{
			MovePlayer1North();
		}
		else if(player1Direction == DirectionEnum.NORTHEAST)
		{
			MovePlayer1NorthEast();
		}
		else if(player1Direction == DirectionEnum.SOUTEAST)
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


function update()
{
	player.x = playerTrail[0].x * config.HEXAGON_SIZE + (config.HEXAGON_SIZE / 2);

	if(playerTrail[0].x % 2 == 0)
	{
		player.y = playerTrail[0].y  * config.HEXAGON_SIZE + playerTrail[0].y * hexagonParameters.h;
	}
	else 
	{
		player.y = (playerTrail[0].y + 0.5) * config.HEXAGON_SIZE + playerTrail[0].y * hexagonParameters.h;
	}

	getInput();
	DoPlayerMovement();
}

window.onload = function ()
{
    game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
}