namespace Floppy {
    export class Bird {
        protected domElement: HTMLElement;
        protected flyingProperties: Floppy.Common.FlyingProperties;
        protected width!: number;
        protected height!: number;
        protected velocity!: number;
        protected position!: number;
        protected rotation!: number;
        public box!: Floppy.Common.BoundingBox;
    
        constructor(domElement: HTMLElement, flyingProperties: Floppy.Common.FlyingProperties) {
            this.domElement = domElement;
            this.flyingProperties = flyingProperties;
            this.reset();
        }
    
        public reset() {
            this.width = 34;
            this.height = 24;
            this.velocity = 0;
            this.position = 180;
            this.rotation = 0;
            this.box = { x: 60, y: 180, width: 34, height: 24 };
        }
    
        public jump() {
            this.velocity = this.flyingProperties.jumpVelocity;
            Floppy.Assets.sounds.jump.play();
        }
    
        public async die() {
            this.domElement.style.transition = `
                transform 1s cubic-bezier(0.65, 0, 0.35, 1)
            `;
            this.position = this.flyingProperties.flightAreaBox.height - this.height;
            this.rotation = 90;
    
            Floppy.Assets.sounds.hit.play();
            await Helpers.wait(500);
            Floppy.Assets.sounds.die.play();
            await Helpers.wait(500);
            this.domElement.style.transition = '';
        }
    
        public tick() {
            this.velocity += this.flyingProperties.gravity;
            this.rotation = Math.min((this.velocity / 10) * 90, 90);
            this.position += this.velocity;
    
            // Clip us back in
            if (this.position < 0) {
                this.position = 0;
            }
    
            if (this.position > this.flyingProperties.flightAreaBox.height) {
                this.position = this.flyingProperties.flightAreaBox.height;
            }
    
            // We draw our bounding box around the bird through a couple steps. Our
            // rotation of the bird is done through the center. So if we've rotated
            // the bird 90 degrees (facing down), our bird becomes 5 px closer to
            // the top and 5 px further from the left -- because it's 10 px wider
            // than it is tall. To make this easier, we first calculate the height
            // and width of our bird and then calculate its x,y based on that.
            const rotationInRadians = Math.abs(Helpers.toRad(this.rotation));
            const widthMultiplier = this.height - this.width; // 24 - 34 = -10
            const heightMultiplier = this.width - this.height; // 34 - 24 = 10
    
            this.box.width = this.width + (widthMultiplier * Math.sin(rotationInRadians));
            this.box.height = this.height + (heightMultiplier * Math.sin(rotationInRadians));
    
            const xShift = (this.width - this.box.width) / 2;
            const yShift = (this.height - this.box.height) / 2;
    
            // We're 60 away from the left (magic number), + x shift
            this.box.x = 60 + xShift;
            // And we're our current bird position from the top + y shift + the
            // distance to the top of the window, because of the sky
            this.box.y = this.position + yShift + this.flyingProperties.flightAreaBox.y;
        }
    
        public draw() {
            gameDebugger.drawBox(this.domElement, this.box);
    
            this.domElement.style.transform = `
                translate3d(0px, ${this.position}px, 0px)
                rotate3d(0, 0, 1, ${this.rotation}deg)
            `;
        }
    }
}