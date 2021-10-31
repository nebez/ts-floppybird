/// <reference path="storage.ts" />
/// <reference path="Bird.ts" />
/// <reference path="GameDebugger.ts" />
/// <reference path="Land.ts" />
/// <reference path="Pipe.ts" />
/// <reference path="PipeManager.ts" />

enum GameState {
    Loading,
    SplashScreen,
    Playing,
    PlayerDying,
    PlayerDead,
    ScoreScreen,
}

const sounds = {
    jump: new Howl({ src: ['assets/sounds/sfx_wing.ogg'], volume: 0.3 }),
    score: new Howl({ src: ['assets/sounds/sfx_point.ogg'], volume: 0.3 }),
    hit: new Howl({ src: ['assets/sounds/sfx_hit.ogg'], volume: 0.3 }),
    die: new Howl({ src: ['assets/sounds/sfx_die.ogg'], volume: 0.3 }),
    swoosh: new Howl({ src: ['assets/sounds/sfx_swooshing.ogg'], volume: 0.3 }),
};

const wait = async (time: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    })
}

const toRad = (degrees: number) => {
    return degrees * Math.PI / 180;
}

const isBoxIntersecting = (a: BoundingBox, b: BoundingBox) => {
    return (
        a.x <= (b.x + b.width) &&
        b.x <= (a.x + a.width) &&
        a.y <= (b.y + b.height) &&
        b.y <= (a.y + a.height)
    );
}

const gameDebugger = new Floppy.GameDebugger(true);

interface FlyingProperties {
    gravity: number;
    jumpVelocity: number;
    flightAreaBox: BoundingBox;
}

interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface GameHtmlElements {
    bird: HTMLElement;
    land: HTMLElement;
    flightArea: HTMLElement;
    replayButton: HTMLElement;
    bigScore: HTMLElement;
    currentScore: HTMLElement;
    highScore: HTMLElement;
}

class Game {
    protected _state!: GameState;
    protected _highScore!: number;
    protected _currentScore!: number;

    protected domElements: GameHtmlElements;
    protected bird: Floppy.Bird;
    protected land: Floppy.Land;
    protected pipes: Floppy.PipeManager;
    protected gameLoop: ReturnType<typeof setInterval> | undefined;

    protected medals = [
        [40, 'platinum'],
        [30, 'gold'],
        [20, 'silver'],
        [10, 'bronze'],
    ] as const;

    constructor(domElements: GameHtmlElements) {
        this.domElements = domElements;
        this.bird = new Floppy.Bird(domElements.bird, {
            gravity: 0.25,
            jumpVelocity: -4.6,
            flightAreaBox: domElements.flightArea.getBoundingClientRect(),
        });
        this.pipes = new Floppy.PipeManager(domElements.flightArea);
        this.land = new Floppy.Land(domElements.land);
        this.state = GameState.Loading;
        this.domElements.replayButton.onclick = this.onReplayTouch.bind(this);
        this.highScore = Floppy.storage.getHighScore();
        this.currentScore = 0;

        requestAnimationFrame(this.draw.bind(this));
    }

    public onScreenTouch(ev: UIEvent) {
        // We want to treat keyboard and touch events as the same EXCEPT during
        // the score screen. If the user is on the score screen, they MUST tap
        // the replay button or press space bar. Tapping anywhere else on the
        // screen should be a no-op.
        if (this.state === GameState.Playing) {
            this.bird.jump();
        } else if (this.state === GameState.SplashScreen) {
            this.start();
        } else if (this.state === GameState.ScoreScreen && ev instanceof KeyboardEvent) {
            this.reset();
        }
    }

    public async splash() {
        const splashImage = document.getElementById('splash')!;
        splashImage.classList.add('visible');
        sounds.swoosh.play();
        this.state = GameState.SplashScreen;
    }

    protected get state() {
        return this._state;
    }

    protected set state(newState: GameState) {
        gameDebugger.logStateChange(this._state, newState);
        document.body.className = `state-${GameState[newState]}`;
        this._state = newState;
    }

    protected get currentScore() {
        return this._currentScore;
    }

    protected set currentScore(newScore: number) {
        this._currentScore = newScore;
        this.domElements.bigScore.replaceChildren(...this.numberToImageElements(newScore, 'big'));
        this.domElements.currentScore.replaceChildren(...this.numberToImageElements(newScore, 'small'));
    }

    protected get highScore() {
        return this._highScore;
    }

    protected set highScore(newScore: number) {
        this._highScore = newScore;
        this.domElements.highScore.replaceChildren(...this.numberToImageElements(newScore, 'small'));
        Floppy.storage.setHighScore(newScore);
    }

    protected onReplayTouch() {
        if (this.state === GameState.ScoreScreen) {
            this.reset();
        }
    }

    protected async reset() {
        this.state = GameState.Loading;
        sounds.swoosh.play();

        const scoreboard = document.getElementById('scoreboard')!;
        scoreboard.classList.add('slide-up');
        // The above animation takes 600ms, but let's add a bit more delay
        await wait(750);

        scoreboard.classList.remove('visible', 'slide-up');
        Array.from(scoreboard.getElementsByClassName('visible')).forEach(e => e.classList.remove('visible'));

        gameDebugger.resetBoxes();

        this.pipes.removeAll();
        this.bird.reset();
        this.currentScore = 0;

        // Find everything that's animated and start it.
        Array.from(document.getElementsByClassName('animated')).forEach(e => {
            (e as HTMLElement).style.animationPlayState = 'running';
            (e as HTMLElement).style.webkitAnimationPlayState = 'running';
        });

        this.splash();
    }

    protected start() {
        const splashImage = document.getElementById('splash')!;
        splashImage.classList.remove('visible');
        this.state = GameState.Playing;
        this.gameLoop = setInterval(this.tick.bind(this), 1000 / 60);

        // Always start the game with a jump! it's just nicer.
        this.bird.jump();
    }

    protected async die() {
        clearInterval(this.gameLoop);

        this.state = GameState.PlayerDying;

        // Find everything that's animated and stop it.
        Array.from(document.getElementsByClassName('animated')).forEach(e => {
            (e as HTMLElement).style.animationPlayState = 'paused';
            (e as HTMLElement).style.webkitAnimationPlayState = 'paused';
        });

        await this.bird.die();

        this.state = GameState.PlayerDead;

        await wait(500);

        sounds.swoosh.play();

        const scoreboard = document.getElementById('scoreboard')!;
        scoreboard.classList.add('visible');
        // The above animation takes 600ms.
        await wait(600);

        sounds.swoosh.play();

        const replay = document.getElementById('replay')!;
        replay.classList.add('visible');

        const wonMedal = this.medals.find(([minimumScore]) => this.currentScore >= minimumScore);

        if (wonMedal) {
            gameDebugger.log('Medal won!', wonMedal);
            const medalContainer = document.getElementById('medal')!;
            const medal = new Image();
            medal.src = `assets/medal_${wonMedal[1]}.png`;
            medalContainer.replaceChildren(medal);
            medalContainer.classList.add('visible');
        }

        // The above animations takes nearly 1200ms. But we don't need to wait
        // the entirety of it to let them replay if they're in a fit of rage.
        await wait(300);

        this.state = GameState.ScoreScreen;
    }

    protected score() {
        gameDebugger.log('Score!');
        sounds.score.play();

        this.currentScore++;

        if (this.currentScore > this.highScore) {
        gameDebugger.log('New highscore!', this.currentScore);
        this.highScore = this.currentScore;
        }

    }

    protected numberToImageElements(digits: number, size: 'big' | 'small') {
        return digits.toString().split('').map(n => {
            const imgDigit = new Image();
            imgDigit.src = `assets/font_${size}_${n}.png`
            return imgDigit;
        });
    }

    protected tick() {
        const now = Date.now();

        this.bird.tick();
        this.pipes.tick(now);

        let unscoredPipe = this.pipes.nextUnscoredPipe();

        if (unscoredPipe && unscoredPipe.hasCrossed(this.bird.box)) {
            unscoredPipe.scored = true;
            this.score();
        }

        if (this.pipes.intersectsWith(this.bird.box) || this.land.intersectsWith(this.bird.box)) {
            this.die();
        }
    }

    protected draw() {
        requestAnimationFrame(this.draw.bind(this));

        this.bird.draw();
    }
}

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

    const game = new Game({ bird, land, flightArea, replayButton, bigScore, currentScore, highScore });

    // They can use both the spacebar or screen taps to interact with the game
    document.onkeydown = (ev: KeyboardEvent) => { ev.keyCode == 32 && game.onScreenTouch(ev); }
    if ('ontouchstart' in document) {
        document.ontouchstart = game.onScreenTouch.bind(game);
    } else {
        document.onmousedown = game.onScreenTouch.bind(game);
    }
    game.splash();
})();

