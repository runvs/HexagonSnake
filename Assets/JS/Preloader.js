var HexagonSnake = HexagonSnake || {};

HexagonSnake.Preloader = function(game)
{

    console.log('%c Preloader Constructor ', 'background: #eee; color: #b000b5');

    this.background = null;
    this.preloadBar = null;

    this.ready = false;

};

HexagonSnake.Preloader.prototype =
{

    preload: function()
    {
        console.log('%c Preloader Preload ', 'background: #222; color: #bada55');

        this.preloadBar = this.add.sprite(this.game.width / 2, this.game.height / 2, 'preloaderBar');
        this.preloadBar.anchor.setTo(0.5, 0.5);

        //  This sets the preloadBar sprite as a loader sprite.
        //  What that does is automatically crop the sprite from 0 to full-width
        //  as the files below are loaded in.
        this.load.setPreloadSprite(this.preloadBar);

        //  Here we load the rest of the assets our game needs.
        //  As this is just a Project Template I've not provided these assets, swap them for your own.
        this.load.image('player', 'Assets/GFX/PlayerTrail.png');
        this.load.spritesheet('tile', 'Assets/GFX/tile.png', 51, 45);
        this.load.image('playerheadN', 'Assets/GFX/PlayerN.png');
        this.load.image('playerheadNE', 'Assets/GFX/PlayerNE.png');
        this.load.image('playerheadSE', 'Assets/GFX/PlayerSE.png');
        this.load.image('playerheadNW', 'Assets/GFX/PlayerNW.png');
        this.load.image('playerheadSW', 'Assets/GFX/PlayerSW.png');
        this.load.image('playerheadS', 'Assets/GFX/PlayerS.png');
        this.load.image('tut', 'Assets/GFX/tut.png');

        this.load.spritesheet('item', 'Assets/GFX/tileBlocked.png', 51, 45);
        this.load.image('twitter', 'Assets/GFX/twitter.png');
        this.load.spritesheet('mute', 'Assets/GFX/mute.png', 51, 44);
        this.load.image('blocked', 'Assets/GFX/item.png');

        this.load.audio('pickup', ['Assets/Audio/pickup.ogg', 'Assets/Audio/pickup.mp3']);
        this.load.audio('fail', ['Assets/Audio/fail.ogg', 'Assets/Audio/fail.mp3']);
        this.load.audio('turn', ['Assets/Audio/turn.ogg', 'Assets/Audio/turn.mp3']);
        this.load.audio('move', ['Assets/Audio/move.ogg', 'Assets/Audio/move.mp3']);
        this.load.audio('music', ['Assets/Audio/music.ogg', 'Assets/Audio/music.mp3']);

        // Load hexagon.js and i18n.js here
        this.load.script('hexagon.js', 'Assets/Js/hexagon.js');
        this.load.script('i18n.js', 'Assets/Js/i18n.js');
    },

    create: function()
    {
        console.log('%c Preloader Create ', 'background: #aaa; color: #a55');

        //  Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
        this.preloadBar.cropEnabled = false;

        if(typeof(i18n[HexagonSnake.lang]) == 'undefined')
        {
            HexagonSnake.lang = 'en';
        }

    },

    update: function()
    {

        //  You don't actually need to do this, but I find it gives a much smoother game experience.
        //  Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
        //  You can jump right into the menu if you want and still play the music, but you'll have a few
        //  seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
        //  it's best to wait for it to decode here first, then carry on.
        
        //  If you don't have any music in your game then put the game.state.start line into the create function and delete
        //  the update function completely.
        
        if (this.cache.isSoundDecoded('music') && this.ready == false)
        {
            this.ready = true;
            this.game.state.start('MainMenu');
        }

    }

};