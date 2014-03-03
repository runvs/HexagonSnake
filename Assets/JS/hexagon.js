function Hexagon(x, y, game, p, spriteName)
{
    this.x = x;
    this.y = y;


    var offX = this.x * p.size;
    var offY = this.y * p.size + this.y * p.h;
    
    if(this.x % 2 == 1)
    {
        offY += 0.61 * p.size;
        offX += 0;
    }
    
    this.graphics = game.add.sprite(offX, offY, spriteName);
}