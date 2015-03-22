import { VIDEO_WIDTH, VIDEO_HEIGHT } from "../../../core/common/constants";

export function ZapperAdapter(zapper) {
  this.zapper = zapper;
}

ZapperAdapter["dependencies"] = [ "videoManager" ];

ZapperAdapter.prototype.init = function(videoManager) {
  return this.videoManager = videoManager;
};

ZapperAdapter.prototype.getDevice = function() {
  return this.zapper;
};

ZapperAdapter.prototype.inputChanged = function(input, down) {
  if (input === "trigger") {
    return this.zapper.setTriggerPressed(down);
  }
};

ZapperAdapter.prototype.stateChanged = function(state) {
  var horizontalScale, rect, verticalScale, x, y;
  rect = this.videoManager.getOutputRect();
  horizontalScale = (rect.right - rect.left) / VIDEO_WIDTH;
  verticalScale = (rect.bottom - rect.top) / VIDEO_HEIGHT;
  x = ~~(((state.cursorX || 0) - rect.left) / horizontalScale);
  y = ~~(((state.cursorY || 0) - rect.top) / verticalScale);
  return this.zapper.setBeamPosition(x, y);
};
