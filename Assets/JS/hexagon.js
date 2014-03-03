function Hexagon(x, y, game, p)
{
    this.x = x;
    this.y = y;

    var graphics = game.add.graphics(this.x, this.y);

    var offX = this.x * p.size;
    var offY = this.y * p.size + this.y * p.h;
    
    if(this.x % 2 == 1)
    {
        offY += 0.5 * p.size;
        offX += 0;
    }
    
    graphics.beginFill(0xFF0000);
    graphics.lineStyle(1, 0xFF0000, 1);
    
    // Draw the hexagon shape
    graphics.moveTo(offX + p.h,       offY);
    graphics.lineTo(offX + p.h + p.s, offY);
    graphics.lineTo(offX + p.size,    offY + p.r);
    graphics.lineTo(offX + p.h + p.s, offY + p.size);
    graphics.lineTo(offX + p.h,       offY + p.size);
    graphics.lineTo(offX,             offY + p.r);
    graphics.lineTo(offX + p.h,       offY);
    graphics.endFill();
}