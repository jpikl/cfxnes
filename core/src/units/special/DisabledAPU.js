import APU from '../APU';

export default class DisabledAPU extends APU {

  tick() {
    // For faster execution when APU is not needed
  }

}
