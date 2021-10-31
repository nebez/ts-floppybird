namespace Floppy {
    export class PipeManager {
        protected pipeAreaDomElement: HTMLElement;
        protected pipeDelay = 1400;
        protected lastPipeInsertedTimestamp = 0;
        protected pipes: Floppy.Pipe[] = [];
    
        constructor(pipeAreaDomElement: HTMLElement) {
            this.pipeAreaDomElement = pipeAreaDomElement;
        }
    
        public tick(now: number) {
            this.pipes.forEach(pipe => pipe.tick());
    
            if (now - this.lastPipeInsertedTimestamp < this.pipeDelay) {
                // Wait a little longer... we don't need to do this too often.
                return;
            }
    
            // Insert a new pipe and then prune all the pipes that have gone
            // entirely off the screen
            gameDebugger.log('inserting pipe after', now - this.lastPipeInsertedTimestamp, 'ms');
            this.lastPipeInsertedTimestamp = now;
            const pipeDimension = this.createPipeDimensions({ gap: 90, minDistanceFromEdges: 80 });
            const pipe = new Floppy.Pipe(pipeDimension);
            this.pipes.push(pipe);
            this.pipeAreaDomElement.appendChild(pipe.domElement);
    
            this.pipes = this.pipes.filter(pipe => {
                if (pipe.isOffScreen()) {
                    gameDebugger.log('pruning a pipe');
                    pipe.domElement.remove();
                    return false;
                }
    
                return true;
            });
        }
    
        public intersectsWith(box: BoundingBox) {
            return this.pipes.find(pipe => pipe.intersectsWith(box)) != null;
        }
    
        public removeAll() {
            this.pipes.forEach(pipe => pipe.domElement.remove());
            this.pipes = [];
        }
    
        public nextUnscoredPipe() {
            return this.pipes.find(pipe => pipe.scored === false);
        }
    
        protected createPipeDimensions(options: { gap: number, minDistanceFromEdges: number }) {
            // The gap between pipes should be 90px. And the positioning of them
            // should be somewhere randomly within the flight area with sufficient
            // buffer from the top of bottom. Our entire "flight" area is 420px.
            // The pipes should be at *least* 80px high, which means they can be
            // at most:
            //     FlightHeight - PipeGap - PipeMinHeight = PipeMaxHeight
            //     420 - 90 - 80 = 250px
            // So if we pick a top pipe size of 80, then the bottom is 250 (and
            // vice versa). Another way of expressing this same thing would be:
            //     FlightHeight - PipeGap - TopPipeHeight = BottomPipeHeight
            //     420 - 90 - 80 = 250px
            const topPipeHeight = this.randomNumberBetween(80, 250);
            const bottomPipeHeight = 420 - options.gap - topPipeHeight;
            return { topPipeHeight, bottomPipeHeight };
        }
    
        protected randomNumberBetween(min: number, max: number) {
            // Generate a random integer between min (inclusive) and max (inclusive).
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }
}
