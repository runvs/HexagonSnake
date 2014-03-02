
var game = new Phaser.Game(800, 600, '', Phaser.AUTO, { preload: preload, create: create, update: update, render: render });

var image;
var cursors;

var posX = 1;
var posY = 1;
var WorldSizeX = 15;
var WorldSizeY = 15;

var hexagonSize = 50;
var inputTimer;

var b = hexagonSize;
var s = b/2.0;
var h = b/4.0;
var r = b/2;
var a = 2*r;

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
    	if(posY<WorldSizeY)
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
    	if(posX<WorldSizeX)
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
		image.y = posY  * hexagonSize + posY *h;
	}
	else 
	{
		image.y = (posY + 0.5) * hexagonSize + posY *h;
	}



	getInput();

}

function render()
{

}