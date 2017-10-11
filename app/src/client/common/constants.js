export const VIDEO_WIDTH = 256;
export const VIDEO_HEIGHT = 240;

export const MIN_VIDEO_SCALE = 1;
export const MAX_VIDEO_H_SCALE = screen.width / VIDEO_WIDTH;
export const MAX_VIDEO_V_SCALE = screen.height / VIDEO_HEIGHT;
export const MAX_VIDEO_SCALE = ~~Math.min(MAX_VIDEO_H_SCALE, MAX_VIDEO_V_SCALE);
