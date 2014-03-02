
var game = new Phaser.Game(800, 600, '', Phaser.AUTO, { preload: preload, create: create, update: update });

function preload()
{
	game.load.image('player', 'Assets/GFX/player.png');
}

var image;
var cursors;

var posX = 0;
var posY = 0;

var hexagonSize = 25;

function create()
{
	image = game.add.sprite(0, 0, 'player');
	cursors = game.input.keyboard.createCursorKeys();
}

function getInput()
{
	if (cursors.up.isDown)
    {
     
        posY -= 1;
    }
	if (cursors.down.isDown)
    {
     
        posY += 1;
    }

    if (cursors.left.isDown)
    {
     
        posX -= 1;
    }
	if (cursors.right.isDown)
    {
     
        posX += 1;
    }
}

function update()
{

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