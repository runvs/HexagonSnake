function Hexagon(x, y, game, p)
{
    this.x = x;
    this.y = y;

    this.graphics = game.add.graphics(this.x, this.y);

    var offX = this.x * p.size;
    var offY = this.y * p.size + this.y * p.h;
    
    if(this.x % 2 == 1)
    {
        offY += 0.61 * p.size;
        offX += 0;
    }
    
    this.graphics.beginFill(0xFF0000);
    this.graphics.lineStyle(1, 0xFF0000, 1);
    
    // Draw the hexagon shape
    this.graphics.moveTo(offX + p.h,       offY);
    this.graphics.lineTo(offX + p.h + p.s, offY);
    this.graphics.lineTo(offX + p.size,    offY + p.r);
    this.graphics.lineTo(offX + p.h + p.s, offY + p.size);
    this.graphics.lineTo(offX + p.h,       offY + p.size);
    this.graphics.lineTo(offX,             offY + p.r);
    this.graphics.lineTo(offX + p.h,       offY);
    this.graphics.endFill();
}