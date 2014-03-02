
var game = new Phaser.Game(800, 600, '', Phaser.AUTO, { preload: preload, create: create, update: update });

var image;
var cursors;

var posX = 1;
var posY = 1;
var WorldSizeX = 15;
var WorldSizeY = 15;

var hexagonSize = 25;
var inputTimer;


function preload()
{
	game.load.image('player', 'Assets/GFX/player.png');
}



function create()
{
	image = game.add.sprite(0, 0, 'player');
	image.anchor = new Phaser.Point(x=0.5, y=0.5);
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
    	if(posY>1)
    	{
        	posY -= 1;
    	}
    }
	else if (cursors.down.isDown)
    {
    	DoInputTimer();
    	if(posY<=WorldSizeY)
    	{
        	posY += 1;
        }
    }

    if (cursors.left.isDown)
    {
    	DoInputTimer();
    	if(posX > 1)
    	{
        	posX -= 1;	
    	}
    }
	else if (cursors.right.isDown)
    {
    	DoInputTimer();
    	if(posX<=WorldSizeX)
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
	image.x = posX * hexagonSize;
	

	if(posX%2==0)
	{
		image.y = posY  * hexagonSize;
	}
	else 
	{
		image.y = (posY + 0.5) * hexagonSize;
	}



	getInput();

}