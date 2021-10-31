namespace Helpers {
    export const wait = async (time: number) => {
        return new Promise(resolve => {
            setTimeout(resolve, time);
        })
    }
    
    export const toRad = (degrees: number) => {
        return degrees * Math.PI / 180;
    }
    
    export const isBoxIntersecting = (a: Floppy.Common.BoundingBox, b: Floppy.Common.BoundingBox) => {
        return (
            a.x <= (b.x + b.width) &&
            b.x <= (a.x + a.width) &&
            a.y <= (b.y + b.height) &&
            b.y <= (a.y + a.height)
        );
    }
}