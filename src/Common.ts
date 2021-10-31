namespace Floppy {
    export namespace Common {
        export enum GameState {
            Loading,
            SplashScreen,
            Playing,
            PlayerDying,
            PlayerDead,
            ScoreScreen,
        }
        
        export interface FlyingProperties {
            gravity: number;
            jumpVelocity: number;
            flightAreaBox: BoundingBox;
        }
        
        export interface BoundingBox {
            x: number;
            y: number;
            width: number;
            height: number;
        }
        
        export interface GameHtmlElements {
            bird: HTMLElement;
            land: HTMLElement;
            flightArea: HTMLElement;
            replayButton: HTMLElement;
            bigScore: HTMLElement;
            currentScore: HTMLElement;
            highScore: HTMLElement;
        }

        export interface GameOptions {
            isDebugOn: boolean;
            isEasyModeOn: boolean;
        }
    }
}