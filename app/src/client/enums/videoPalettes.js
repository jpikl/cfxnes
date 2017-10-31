import {createOptions} from './utils';

export const ASQ_REAL_A = 'asq-real-a';
export const ASQ_REAL_B = 'asq-real-b';
export const BMF_FIN_R2 = 'bmf-fin-r2';
export const BMF_FIN_R3 = 'bmf-fin-r3';
export const FCEU_13 = 'fceu-13';
export const FCEU_15 = 'fceu-15';
export const FCEUX = 'fceux';
export const NESTOPIA_RGB = 'nestopia-rgb';
export const NESTOPIA_YUV = 'nestopia-yuv';
export const SONY_CXA2025AS = 'sony-cxa2025as';
export const UNSATURATED_V6 = 'unsaturated-v6';

export const values = [
  ASQ_REAL_A,
  ASQ_REAL_B,
  BMF_FIN_R2,
  BMF_FIN_R3,
  FCEU_13,
  FCEU_15,
  FCEUX,
  NESTOPIA_RGB,
  NESTOPIA_YUV,
  SONY_CXA2025AS,
  UNSATURATED_V6,
];

export const labels = {
  [ASQ_REAL_A]: 'ASQ (reality A)',
  [ASQ_REAL_B]: 'ASQ (reality B)',
  [BMF_FIN_R2]: 'BMF (final revision 2)',
  [BMF_FIN_R3]: 'BMF (final revision 3)',
  [FCEU_13]: 'FCEU .13',
  [FCEU_15]: 'FCEU .15',
  [FCEUX]: 'FCEUX',
  [NESTOPIA_RGB]: 'Nestopia (RGB)',
  [NESTOPIA_YUV]: 'Nestopia (YUV)',
  [SONY_CXA2025AS]: 'SONY CXA2025AS US',
  [UNSATURATED_V6]: 'Unsaturated V6',
};

export const options = createOptions(values, labels);

export default values;
