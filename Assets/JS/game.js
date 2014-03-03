var config =
{
    HEXAGON_SIZE: 50,
    WORLD_SIZE:
    {
        x: 15,
        y: 9
    }
};

var game;
var player;
var cursors;

var posX = 0;
var posY = 0;

var inputTimer;

var hexagonParameters = {};
var hexagons = [];

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

function DoInputTimer()
{
	inputTimer += 0.25;
}

function getInput()
{
	if (cursors.up.isDown)
    {
    	DoInputTimer();
    	if(posY >= 1)
    	{
        	posY -= 1;
    	}
    }
	else if (cursors.down.isDown)
    {
    	DoInputTimer();
    	if(posY < config.WORLD_SIZE.y)
    	{
        	posY += 1;
        }
    }

    if (cursors.left.isDown)
    {
    	DoInputTimer();
    	if(posX >= 1)
    	{
        	posX -= 1;	
    	}
    }
	else if (cursors.right.isDown)
    {
    	DoInputTimer();
    	if(posX < config.WORLD_SIZE.x)
    	{
        	posX += 1;
        }
    }
}




function update()
{
	console.log(inputTimer);
	if(inputTimer >= 0)
	{
		inputTimer -= game.time.elapsed;
	}
	player.x = posX * config.HEXAGON_SIZE;
	

	if(posX%2==0)
	{
		player.y = posY  * config.HEXAGON_SIZE + posY * hexagonParameters.h;
	}
	else 
	{
		player.y = (posY + 0.5) * config.HEXAGON_SIZE + posY * hexagonParameters.h;
	}



	getInput();

}

function render()
{

}

window.onload = function()
{
    game = new Phaser.Game(800, 600, '', Phaser.AUTO, { preload: preload, create: create, update: update, render: render });
}