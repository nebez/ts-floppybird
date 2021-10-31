namespace Floppy {
    export class Game {
        protected _state!: Floppy.Common.GameState;
        protected _highScore!: number;
        protected _currentScore!: number;
    
        protected domElements: Floppy.Common.GameHtmlElements;
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
    
        constructor(domElements: Floppy.Common.GameHtmlElements, options: Floppy.Common.GameOptions) {
            this.domElements = domElements;
            this.bird = new Floppy.Bird(domElements.bird, {
                gravity: 0.25,
                jumpVelocity: -4.6,
                flightAreaBox: domElements.flightArea.getBoundingClientRect(),
            });
            this.pipes = new Floppy.PipeManager(domElements.flightArea, options.isEasyModeOn);
            this.land = new Floppy.Land(domElements.land);
            this.state = Floppy.Common.GameState.Loading;
            this.domElements.replayButton.onclick = this.onReplayTouch.bind(this);
            this.highScore = Floppy.storage.getHighScore();
            this.currentScore = 0;
            this.setGameOptionButtons(options);
    
            requestAnimationFrame(this.draw.bind(this));
        }
    
        public onScreenTouch(ev: UIEvent) {
            // We want to treat keyboard and touch events as the same EXCEPT during
            // the score screen. If the user is on the score screen, they MUST tap
            // the replay button or press space bar. Tapping anywhere else on the
            // screen should be a no-op.
            if (this.state === Floppy.Common.GameState.Playing) {
                this.bird.jump();
            } else if (this.state === Floppy.Common.GameState.SplashScreen) {
                this.start();
            } else if (this.state === Floppy.Common.GameState.ScoreScreen && ev instanceof KeyboardEvent) {
                this.reset();
            }
        }
    
        public async splash() {
            const splashImage = document.getElementById('splash')!;
            splashImage.classList.add('visible');
            Floppy.Assets.sounds.swoosh.play();
            this.state = Floppy.Common.GameState.SplashScreen;
        }
    
        protected get state() {
            return this._state;
        }
    
        protected set state(newState: Floppy.Common.GameState) {
            gameDebugger.logStateChange(this._state, newState);
            document.body.className = `state-${Floppy.Common.GameState[newState]}`;
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

        protected setGameOptionButtons(options: Floppy.Common.GameOptions) {
            const optionsButtons = document.getElementById('game-options')!;
            const easyMode = optionsButtons.getElementsByClassName('option-easy')[0] as HTMLAnchorElement;
            const debugMode = optionsButtons.getElementsByClassName('option-debug')[0] as HTMLAnchorElement;

            easyMode.innerText = `easy mode (${options.isEasyModeOn ? 'ON' : 'OFF' })`;
            easyMode.href = '?';
            easyMode.href += options.isEasyModeOn ? '' : 'easy';
            easyMode.href += options.isDebugOn ? 'debug' : '';

            debugMode.innerText = `debug (${options.isDebugOn ? 'ON' : 'OFF' })`;
            debugMode.href = '?';
            debugMode.href += options.isEasyModeOn ? 'easy' : '';
            debugMode.href += options.isDebugOn ? '' : 'debug';
        }
    
        protected onReplayTouch() {
            if (this.state === Floppy.Common.GameState.ScoreScreen) {
                this.reset();
            }
        }
    
        protected async reset() {
            this.state = Floppy.Common.GameState.Loading;
            Floppy.Assets.sounds.swoosh.play();
    
            const scoreboard = document.getElementById('scoreboard')!;
            scoreboard.classList.add('slide-up');
            // The above animation takes 600ms, but let's add a bit more delay
            await Helpers.wait(750);
    
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
            this.state = Floppy.Common.GameState.Playing;
            this.gameLoop = setInterval(this.tick.bind(this), 1000 / 60);
    
            // Always start the game with a jump! it's just nicer.
            this.bird.jump();
        }
    
        protected async die() {
            clearInterval(this.gameLoop);
    
            this.state = Floppy.Common.GameState.PlayerDying;
    
            // Find everything that's animated and stop it.
            Array.from(document.getElementsByClassName('animated')).forEach(e => {
                (e as HTMLElement).style.animationPlayState = 'paused';
                (e as HTMLElement).style.webkitAnimationPlayState = 'paused';
            });
    
            await this.bird.die();
    
            this.state = Floppy.Common.GameState.PlayerDead;
    
            await Helpers.wait(500);
    
            Floppy.Assets.sounds.swoosh.play();
    
            const scoreboard = document.getElementById('scoreboard')!;
            scoreboard.classList.add('visible');
            // The above animation takes 600ms.
            await Helpers.wait(600);
    
            Floppy.Assets.sounds.swoosh.play();
    
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
            await Helpers.wait(300);
    
            this.state = Floppy.Common.GameState.ScoreScreen;
        }
    
        protected score() {
            gameDebugger.log('Score!');
            Floppy.Assets.sounds.score.play();
    
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
}