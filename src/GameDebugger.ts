namespace Floppy {
    export class GameDebugger {
        protected enabled;
        protected domLogs = document.getElementById('debug-logs')!;
        protected domState = document.getElementById('debug-state')!;
        protected domBoxContainer = document.getElementById('debug')!;
        protected domBoxes = new Map<HTMLElement, HTMLDivElement>();
    
        constructor(enabled: boolean) {
            this.enabled = enabled;
        }
    
        public drawBox(key: HTMLElement, box: BoundingBox) {
            if (!this.enabled) {
                return;
            }
    
            if (!this.domBoxes.has(key)) {
                const newDebugBox = document.createElement('div');
                newDebugBox.className = 'boundingbox';
                this.domBoxContainer.appendChild(newDebugBox);
                this.domBoxes.set(key, newDebugBox);
            }
    
            const boudingBox = this.domBoxes.get(key);
    
            if (boudingBox == null) {
                this.log(`couldn't create a debug box for ${key}`);
                return;
            }
    
            boudingBox.style.top = `${box.y}px`;
            boudingBox.style.left = `${box.x}px`;
            boudingBox.style.width = `${box.width}px`;
            boudingBox.style.height = `${box.height}px`;
        }
    
        public resetBoxes() {
            if (!this.enabled) {
                return;
            }
    
            // Only pipes need resetting. Land and bird are recycled. The debugger
            // probably shouldn't be aware of this but who cares :)
            this.domBoxes.forEach((debugBox, pipe) => {
                if (pipe.className.includes('pipe')) {
                    debugBox.remove();
                    this.domBoxes.delete(pipe);
                }
            });
        }
    
        public logStateChange(oldState: GameState, newState: GameState) {
            if (!this.enabled) {
                return;
            }
    
            this.log('Changing state', GameState[oldState], GameState[newState]);
            this.domState.innerText = GameState[newState];
        }
    
        public log(...args: any[]) {
            if (!this.enabled) {
                return;
            }
    
            // Current time is only really useful to see difference in ms between
            // events - we don't need to see ms elapsed since epoch. The rest of
            // the slice and "00000" garbage is so we get a consistent width.
            const shortTime = ("00000" + Date.now() % 100000).slice(-5);
    
            console.log(`[${shortTime}]`, ...args);
            this.domLogs.innerText += `[${shortTime}] ${args.map(a => a?.toString()).join(' ')}\n`;
        }
    }
}