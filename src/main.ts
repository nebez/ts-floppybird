/// <reference path="helpers.ts" />
/// <reference path="storage.ts" />

/// <reference path="Assets.ts" />
/// <reference path="Bird.ts" />
/// <reference path="Common.ts" />
/// <reference path="Game.ts" />
/// <reference path="GameDebugger.ts" />
/// <reference path="Land.ts" />
/// <reference path="Pipe.ts" />
/// <reference path="PipeManager.ts" />

// A debugger is defined globally as almost all game files rely on its presence
const isDebugOn = window.location.search.includes('debug');
const isEasyModeOn = window.location.search.includes('easy');
const gameDebugger = new Floppy.GameDebugger(isDebugOn);

(function() {
    const bird = document.getElementById('player');
    const land = document.getElementById('land');
    const flightArea = document.getElementById('flyarea');
    const replayButton = document.getElementById('replay');
    const bigScore = document.getElementById('bigscore');
    const currentScore = document.getElementById('currentscore');
    const highScore = document.getElementById('highscore');

    if (bird == null || flightArea == null || land == null || replayButton == null || bigScore == null || currentScore == null || highScore == null) {
        throw new Error('Missing an element');
    }

    const game = new Floppy.Game({ bird, land, flightArea, replayButton, bigScore, currentScore, highScore }, { isDebugOn, isEasyModeOn });

    // They can use both the spacebar or screen taps to interact with the game
    document.onkeydown = (ev: KeyboardEvent) => { ev.keyCode == 32 && game.onScreenTouch(ev); }
    if ('ontouchstart' in document) {
        document.ontouchstart = game.onScreenTouch.bind(game);
    } else {
        document.onmousedown = game.onScreenTouch.bind(game);
    }
    game.splash();
})();

