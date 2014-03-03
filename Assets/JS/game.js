
var game;

var image;
var cursors;


var WorldSizeX = 15;
var WorldSizeY = 15;

var hexagonSize = 50;

var inputTimer = 0;
var movementTimer = 0;


var b = hexagonSize;
var s = b/2.0;
var h = b/4.0;
var r = b/2;
var a = 2*r;

DirectionEnum = {
    NORTH : 0,
    NORTHEAST : 1,
    SOUTEAST : 2,
    SOUTH : 3,
    SOUTHWEST :4,
    NORTHWEST : 5
}

var player1Direction = DirectionEnum.NORTHWEST;
var posX = 1;
var posY = 1;


window.onload = function ()
{
    game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
}


function preload()
{
	game.load.image('player', 'Assets/GFX/player.png');
}


function create()
{
	var graphics = game.add.graphics(0,0);
    // set a fill and line style
    
    

	for (var i = 1; i < WorldSizeX+1; i++) 
	{
		for (var j = 1; j < WorldSizeY+1; j++) 
		{
			var offX = i*b;
			var offY = j*b + j*h;
			if(i%2==1)
			{
				offY += 0.5 * b;
				offX += 0;
			}
			
		    graphics.beginFill(0xFF0000);
		    graphics.lineStyle(1, 0xFF0000, 1);
		    // draw a shape
			graphics.moveTo(offX+h,offY);
		    graphics.lineTo(offX+h+s, offY);
		    graphics.lineTo(offX+b, offY+r);
		    graphics.lineTo(offX+h+s, offY +b);
		    graphics.lineTo(offX+h, offY +b);
		    graphics.lineTo(offX, offY +r);
		    graphics.lineTo(offX+h, offY);
		     graphics.endFill();
		}
	}



	image = game.add.sprite(0, 0, 'player');
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
 		inputTimer = game.time.now + 250;
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
	if(posX%2==0)
	{
		MovePlayer1North();
	}
	if(posX < WorldSizeX)
	{
		posX += 1;
	}

}

function MovePlayer1SouthEast()
{
	if(posX%2==1)
	{
		MovePlayer1South();
	}
	if(posX < WorldSizeX)
	{
		posX += 1;
	}
	
}

function MovePlayer1South()
{
	if(posY < WorldSizeY)
	{
		posY += 1;
	}
}

function MovePlayer1SouthWest()
{
	if(posX%2==1)
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
	if(posX%2==0)
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
	image.x = posX * hexagonSize;
	if(posX%2==0)
	{
		image.y = posY  * hexagonSize + posY *h;
	}
	else 
	{
		image.y = (posY + 0.5) * hexagonSize + posY *h;
	}

	getInput();

	DoPlayerMovement();


}

function render()
{

}