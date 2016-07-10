export default class ZapperAdapter {

  constructor(zapper) {
    this.zapper = zapper;
  }

  getDevice() {
    return this.zapper;
  }

  updateInput(name, value) {
    if (name === 'trigger') {
      this.zapper.setTriggerPressed(value);
    } else if (name === 'beam') {
      this.zapper.setBeamPosition(value[0], value[1]);
    }
  }

}
