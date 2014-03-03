function Hexagon(x, y, game, p)
{
    this.x = x;
    this.y = y;

    var graphics = game.add.graphics(this.x, this.y);

    var offX = this.x * p.b;
    var offY = this.y * p.b + this.y * p.h;
    
    if(this.x % 2 == 1)
    {
        offY += 0.5 * p.b;
        offX += 0;
    }
    
    graphics.beginFill(0xFF0000);
    graphics.lineStyle(1, 0xFF0000, 1);
    
    // Draw the hexagon shape
    graphics.moveTo(offX + p.h,       offY);
    graphics.lineTo(offX + p.h + p.s, offY);
    graphics.lineTo(offX + p.b,       offY + p.r);
    graphics.lineTo(offX + p.h + p.s, offY + p.b);
    graphics.lineTo(offX + p.h,       offY + p.b);
    graphics.lineTo(offX,             offY + p.r);
    graphics.lineTo(offX + p.h,       offY);
    graphics.endFill();
}