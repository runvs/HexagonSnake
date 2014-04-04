var HexagonSnake = HexagonSnake || {};

HexagonSnake.Boot = function(game)
{
    console.log('%c Boot Constructor ', 'background: #eee; color: #b000b5');
};

HexagonSnake.Boot.prototype =
{

    preload: function()
    {
        console.log('%c Boot Preload ', 'background: #222; color: #bada55');

        this.load.image('preloaderBar', 'Assets/GFX/Preloader_Bar.png');

    },

    create: function()
    {
        console.log('%c Boot Create ', 'background: #aaa; color: #a55');

        HexagonSnake.lang = navigator.language.substr(0, 2);

        //  Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
        this.input.maxPointers = 1;

        //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
        this.stage.disableVisibilityChange = true;

        this.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
        this.stage.scale.setShowAll();
        this.stage.scale.refresh();

        //  By this point the preloader assets have loaded to the cache, we've set the game settings
        //  So now let's start the real preloader going
        this.game.state.start('Preloader');

    }

};