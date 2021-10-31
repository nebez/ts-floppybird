namespace Floppy {
    export class Land {
        public domElement: HTMLElement;
        public box: BoundingBox;
    
        constructor(domElement: HTMLElement) {
            this.domElement = domElement;
            this.box = domElement.getBoundingClientRect();
    
            gameDebugger.drawBox(this.domElement, this.box);
        }
    
        public intersectsWith(box: BoundingBox) {
            return isBoxIntersecting(this.box, box);
        }
    }
}