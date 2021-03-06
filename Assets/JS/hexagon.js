function Hexagon(x, y, game, p, spriteName, hexagonGroup)
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
    hexagonGroup.add(this.graphics);

    this.graphics.animations.add('ani');

    var tween = game.add.tween(this.graphics).to({ alpha: 0.5 }, 500, null, true, x * 50 * (Math.random() * 0.8 + 1), true, true);
    tween.onComplete.add(onComplete, this);

    function onComplete() {
        tween = game.add.tween(this.graphics).to({ alpha: 0.7 }, 500, null, true, y * 50 * (Math.random() * 0.8 + 1), true, true);
        tween.onComplete.add(onComplete, this);
    };
}