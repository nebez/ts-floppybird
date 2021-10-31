namespace Floppy {
    const testLocalStorageWorks = () => {
        try {
            window.localStorage.setItem('test', 'test');
            window.localStorage.removeItem('test');
            return true;
        } catch {
            return false;
        }
    }

    const isLsEnabled = testLocalStorageWorks();

    export const storage = {
        setHighScore: (score: number) => {
            if (!isLsEnabled) {
                return;
            }
    
            window.localStorage.setItem('highscore', score.toString());
        },
        getHighScore: () => {
            if (!isLsEnabled) {
                return 0;
            }
    
            return parseInt(window.localStorage.getItem('highscore') ?? '0');
        },
    };
}