export const MASTER = 'master';
export const PULSE_1 = 'pulse1';
export const PULSE_2 = 'pulse2';
export const TRIANGLE = 'triangle';
export const NOISE = 'noise';
export const DMC = 'dmc';

export const values = [MASTER, PULSE_1, PULSE_2, TRIANGLE, NOISE, DMC];

const labels = {
  [MASTER]: 'Master volume',
  [PULSE_1]: 'Pulse channel 1',
  [PULSE_2]: 'Pulse channel 2',
  [TRIANGLE]: 'Triangle channel',
  [NOISE]: 'Noise channel',
  [DMC]: 'DMC channel',
};

export function getLabel(channel) {
  return labels[channel];
}

export default values;
