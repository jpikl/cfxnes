// Interrupt flags
export const RESET = 0x01;   // CPU reset
export const NMI = 0x02;     // Non-maskable interrupt
export const IRQ_APU = 0x04; // Interrupt caused by APU
export const IRQ_DMC = 0x08; // Interrupt caused by DMC channel
export const IRQ_EXT = 0x10; // Interrupt caused by mapper
export const IRQ = IRQ_APU | IRQ_DMC | IRQ_EXT; // Mask for all IRQ types
