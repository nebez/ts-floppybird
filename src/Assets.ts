namespace Floppy {
    export namespace Assets {
        export const sounds = {
            jump: new Howl({ src: ['assets/sounds/sfx_wing.ogg'], volume: 0.3 }),
            score: new Howl({ src: ['assets/sounds/sfx_point.ogg'], volume: 0.3 }),
            hit: new Howl({ src: ['assets/sounds/sfx_hit.ogg'], volume: 0.3 }),
            die: new Howl({ src: ['assets/sounds/sfx_die.ogg'], volume: 0.3 }),
            swoosh: new Howl({ src: ['assets/sounds/sfx_swooshing.ogg'], volume: 0.3 }),
        };
    }
}