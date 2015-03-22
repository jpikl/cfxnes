import { LITTLE_ENDIAN } from "./system";

//=========================================================
// Color manipulation utilities
//=========================================================

export const BLACK_COLOR = packColor(0, 0, 0);

export function packColor(r, g, b, a = 0xFF) {
    if (LITTLE_ENDIAN) {
        return a << 24 | b << 16 | g << 8 | r;
    } else {
        return r << 24 | g << 16 | b << 8 | a;
    }
}

export function unpackColor(color) {
    if (LITTLE_ENDIAN) {
        return [
            (color       ) & 0xFF,
            (color >>>  8) & 0xFF,
            (color >>> 16) & 0xFF,
            (color >>> 24) & 0xFF
        ];
    } else {
        return [
            (color >>> 24) & 0xFF,
            (color >>> 16) & 0xFF,
            (color >>>  8) & 0xFF,
            (color       ) & 0xFF
        ];
    }
}
