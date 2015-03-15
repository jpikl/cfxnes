var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

function Joypad() {
  this.setButtonPressed = bind(this.setButtonPressed, this);
  this.buttonStates = (function() {
    var i, results;
    results = [];
    for (i = 0; i <= 24; i++) {
      results.push(0);
    }
    return results;
  })();
  this.buttonStates[19] = 1;
  this.readPosition = 0;
}

Joypad.Button = {
  A: 0,
  B: 1,
  SELECT: 2,
  START: 3,
  UP: 4,
  DOWN: 5,
  LEFT: 6,
  RIGHT: 7
};

Joypad.prototype.strobe = function() {
  return this.readPosition = 0;
};

Joypad.prototype.read = function() {
  return this.buttonStates[this.moveReadPosition()];
};

Joypad.prototype.moveReadPosition = function() {
  var previousPosition;
  previousPosition = this.readPosition;
  this.readPosition = (this.readPosition + 1) % 24;
  return previousPosition;
};

Joypad.prototype.setButtonPressed = function(button, pressed) {
  return this.buttonStates[button] = +pressed;
};

module.exports = Joypad;
