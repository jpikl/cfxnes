var
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

const BUTTON_ALIASES = {
  1: "left",
  2: "right",
  3: "middle",
  4: "middle"
};

export function Mouse(id) {
  this.id = id;
  this.onMouseUp = bind(this.onMouseUp, this);
  this.onMouseDown = bind(this.onMouseDown, this);
  this.onMouseMove = bind(this.onMouseMove, this);
}

Mouse["dependencies"] = ["inputManager", "videoManager"];

Mouse.prototype.init = function(inputManager, videoManager) {
  this.inputManager = inputManager;
  this.videoManager = videoManager;
  window.addEventListener("mousemove", this.onMouseMove);
  window.addEventListener("mousedown", this.onMouseDown);
  return window.addEventListener("mouseup", this.onMouseUp);
};

Mouse.prototype.onMouseMove = function(event) {
  event || (event = window.event);
  this.x = event.clientX;
  return this.y = event.clientY;
};

Mouse.prototype.onMouseDown = function(event) {
  if (this.canProcessEvent()) {
    return this.processEvent(event, true);
  }
};

Mouse.prototype.onMouseUp = function(event) {
  if (this.canProcessEvent()) {
    return this.processEvent(event, false);
  }
};

Mouse.prototype.processEvent = function(event, down) {
  var button, input;
  event || (event = window.event);
  button = event.button || event.which;
  input = BUTTON_ALIASES[button];
  if (input && this.inputManager.processInput(this.id, input, down)) {
    return event.preventDefault();
  }
};

Mouse.prototype.canProcessEvent = function() {
  return this.inputManager.isRecording() || this.isMouseInCanvasRect();
};

Mouse.prototype.isMouseInCanvasRect = function() {
  var rect;
  rect = this.videoManager.getOutputRect();
  return this.x >= rect.left && this.x <= rect.right && this.y >= rect.top && this.y <= rect.bottom;
};

Mouse.prototype.readState = function(state) {
  state.cursorX = this.x;
  return state.cursorY = this.y;
};

Mouse.prototype.getInputName = function(input) {
  return input[0].toUpperCase() + input.slice(1) + " mouse button";
};
