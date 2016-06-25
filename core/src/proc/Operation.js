export default class Operation {

  constructor(instruction, addressingMode, flags) {
    this.instruction = instruction;
    this.addressingMode = addressingMode;
    this.flags = flags;
  }

}
