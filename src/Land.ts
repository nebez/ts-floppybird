namespace Floppy {
    export class Land {
        public domElement: HTMLElement;
        public box: Floppy.Common.BoundingBox;
    
        constructor(domElement: HTMLElement) {
            this.domElement = domElement;
            this.box = domElement.getBoundingClientRect();
    
            gameDebugger.drawBox(this.domElement, this.box);
        }
    
        public intersectsWith(box: Floppy.Common.BoundingBox) {
            return Helpers.isBoxIntersecting(this.box, box);
        }
    }
}