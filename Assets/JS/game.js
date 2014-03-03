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
var posX = 0;
var posY = 0;

function preload()
{
	game.load.image('player', 'Assets/GFX/player.png');
}

function create()
{
    // Set hexagon parameters
    hexagonParameters.b = 50;
    hexagonParameters.s = hexagonParameters.b / 2.0;
    hexagonParameters.h = hexagonParameters.b / 4.0;
    hexagonParameters.r = hexagonParameters.b / 2;
    hexagonParameters.a = 2 * hexagonParameters.r;

	
    // set a fill and line style

	for (var i = 0; i < config.WORLD_SIZE.x + 1; i++) 
	{
		for (var j = 0; j < config.WORLD_SIZE.y + 1; j++) 
		{
			hexagons.push(new Hexagon(i, j, game, hexagonParameters));
		}
	}

	player = game.add.sprite(0, 0, 'player');
	//image.anchor = new Phaser.Point(x=0.5, y=0.5);
	cursors = game.input.keyboard.createCursorKeys();
	inputTimer = 0;
}

function getInput()
{
	// if (cursors.up.isDown)
 //    {
 //    	if(game.time.now > inputTimer)
 //    	{
 //        	MovePlayer1North();
 //        	inputTimer = game.time.now + 250;
 //    	}
 //    }
	// else if (cursors.down.isDown)
 //    {
 //    	if(game.time.now > inputTimer)
 //    	{
 //        	MovePlayer1South()
 //        	inputTimer = game.time.now + 250;
 //        }
 //    }

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
	if(posY > 1)
	{
		posY -= 1;
	}
}

function MovePlayer1NorthEast()
{
	if(posX % 2 == 0)
	{
		MovePlayer1North();
	}
	
    if(posX < config.WORLD_SIZE.x)
	{
		posX += 1;
	}
}

function MovePlayer1SouthEast()
{
	if(posX % 2 == 1)
	{
		MovePlayer1South();
	}
	
    if(posX < config.WORLD_SIZE.x)
	{
		posX += 1;
	}
}

function MovePlayer1South()
{
	if(posY < config.WORLD_SIZE.y)
	{
		posY += 1;
	}
}

function MovePlayer1SouthWest()
{
	if(posX % 2 == 1)
	{
		MovePlayer1South();
	}

	if(posX > 1)
	{
		posX -= 1;
	}
}

function MovePlayer1NorthWest()
{
	if(posX % 2 == 0)
	{
		MovePlayer1North();
	}

	if(posX > 1)
	{
		posX -= 1;
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
	player.x = posX * config.HEXAGON_SIZE;

	if(posX % 2 == 0)
	{
		player.y = posY  * config.HEXAGON_SIZE + posY * hexagonParameters.h;
	}
	else 
	{
		player.y = (posY + 0.5) * config.HEXAGON_SIZE + posY * hexagonParameters.h;
	}

	getInput();
	DoPlayerMovement();
}

window.onload = function ()
{
    game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
}