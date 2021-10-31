namespace Floppy {
    export class Pipe {
        public scored = false;
        public domElement: HTMLDivElement;
        protected upperPipeDomElement: HTMLDivElement;
        protected lowerPipeDomElement: HTMLDivElement;
        protected upperBox: Floppy.Common.BoundingBox = { x: 0, y: 0, width: 0, height: 0 };
        protected lowerBox: Floppy.Common.BoundingBox = { x: 0, y: 0, width: 0, height: 0 };
    
        constructor(options: { topPipeHeight: number, bottomPipeHeight: number }) {
            this.domElement = document.createElement('div');
            this.domElement.className = 'pipe animated';
    
            this.upperPipeDomElement = document.createElement('div');
            this.upperPipeDomElement.className = 'pipe_upper';
            this.upperPipeDomElement.style.height = `${options.topPipeHeight}px`;
    
            this.lowerPipeDomElement = document.createElement('div');
            this.lowerPipeDomElement.className = 'pipe_lower';
            this.lowerPipeDomElement.style.height = `${options.bottomPipeHeight}px`;
    
            this.domElement.appendChild(this.upperPipeDomElement);
            this.domElement.appendChild(this.lowerPipeDomElement);
        }
    
        public isOffScreen() {
            return this.upperBox.x <= -100;
        }
    
        public hasCrossed(box: Floppy.Common.BoundingBox) {
            // Little bug with attempting to understand if we've crossed something
            // before we've actually rendered. We can fix one of two ways: wait to
            // render (setImmediate, or wait another ticket), or check for width.
            // First option sounds like it would fix other bugs that are probably
            // lingering but no thanks.
            return this.upperBox.width !== 0 && this.upperBox.x + this.upperBox.width <= box.x;
        }
    
        public intersectsWith(box: Floppy.Common.BoundingBox) {
            return Helpers.isBoxIntersecting(this.upperBox, box) || Helpers.isBoxIntersecting(this.lowerBox, box);
        }
    
        public tick() {
            this.upperBox = this.upperPipeDomElement.getBoundingClientRect();
            this.lowerBox = this.lowerPipeDomElement.getBoundingClientRect();
    
            // TODO: This should be in draw not tick. Find a way to move it after.
            gameDebugger.drawBox(this.upperPipeDomElement, this.upperBox);
            gameDebugger.drawBox(this.lowerPipeDomElement, this.lowerBox);
        }
    }
}