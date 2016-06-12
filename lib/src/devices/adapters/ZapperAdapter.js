import {VIDEO_WIDTH, VIDEO_HEIGHT} from '../../../../core/src/constants';

//=========================================================
// Adapter for zapper device
//=========================================================

export default class ZapperAdapter {

  constructor(zapper) {
    this.dependencies = ['videoModule'];
    this.zapper = zapper;
  }

  inject(videoModule) {
    this.videoModule = videoModule;
  }

  getDevice() {
    return this.zapper;
  }

  inputChanged(name, down) {
    if (name === 'trigger') {
      this.zapper.setTriggerPressed(down);
    }
  }

  stateChanged(state) {
    const rect = this.videoModule.getOutputRect();
    const horizontalScale = (rect.right - rect.left) / VIDEO_WIDTH;
    const verticalScale = (rect.bottom - rect.top) / VIDEO_HEIGHT;
    const x = ~~(((state.cursorX || -1) - rect.left) / horizontalScale);
    const y = ~~(((state.cursorY || -1) - rect.top) / verticalScale);
    this.zapper.setBeamPosition(x, y);
  }

}
