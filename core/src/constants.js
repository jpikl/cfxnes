// Size of video output
export const VIDEO_WIDTH = 256;
export const VIDEO_HEIGHT = 240;

// Interupt flags
export const RESET = 0x01;   // CPU reset
export const NMI = 0x02;     // Non-maskable interrupt
export const IRQ_APU = 0x04; // Interrupt caused by APU
export const IRQ_DCM = 0x08; // Interrupt caused by DCM channel
export const IRQ_EXT = 0x10; // Interrupt caused by mapper
export const IRQ = IRQ_APU | IRQ_DCM | IRQ_EXT; // Mask for all IRQ types

// Length counter values for APU channels
export const LENGTH_COUNTER_VALUES = [
  10, 254, 20, 2, 40, 4, 80, 6, 160, 8, 60, 10, 14, 12, 26, 14,     // 00-0F
  12, 16, 24, 18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30,  // 10-1F
];
