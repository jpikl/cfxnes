import Gamepad from '../../../src/input/sources/Gamepad';
import {asyncIt} from '../../utils';

const DELAY = 100;

describe('input/sources/Gamepad', () => {
  let source, router, gamepad, getGamepads;

  before(() => {
    ({getGamepads} = navigator);
    navigator.getGamepads = () => [gamepad];
  });

  after(() => {
    navigator.getGamepads = getGamepads;
  });

  beforeEach(() => {
    gamepad = {
      id: 'mock',
      index: 0,
      connected: true,
      mapping: '',
      axes: new Array(8).fill(0),
      buttons: new Array(11).fill(null).map(() => ({pressed: false, value: 0})),
      timestamp: Date.now(),
    };
    router = {
      inputs: [],
      routeInput(input) {
        this.input = input;
        this.inputs.push(input);
        return true;
      },
    };
    router = {
      inputs: [],
      values: [],
      routeInput(input, value) {
        this.inputs.push(input);
        this.values.push(value);
        this.input = input;
        this.value = value;
        return true;
      },
    };
    source = new Gamepad(router);
    source.activate();
  });

  afterEach(() => {
    source.deactivate();
  });

  asyncIt('generates inputs when activated', DELAY, () => {
    gamepad.buttons[0].pressed = true;
  }, () => {
    expect(router.input).to.be.an('object');
  });

  asyncIt('does not generate inputs when deactivated', DELAY, () => {
    source.deactivate();
  }, () => {
    gamepad.buttons[0].pressed = true;
  }, () => {
    expect(router.input).to.be.undefined;
  });

  asyncIt('generates input for button press (generic mapping)', DELAY, () => {
    gamepad.buttons[0].pressed = true;
  }, () => {
    expect(router.input.source).to.equal('gamepad0');
    expect(router.input.name).to.equal('button-0');
    expect(router.value).to.be.true;
  });

  asyncIt('generates input for button release (generic mapping)', DELAY, () => {
    gamepad.buttons[1].pressed = true;
  }, () => {
    gamepad.buttons[1].pressed = false;
  }, () => {
    expect(router.input.source).to.equal('gamepad0');
    expect(router.input.name).to.equal('button-1');
    expect(router.value).to.be.false;
  });

  asyncIt('generates input for button press (standard mapping)', DELAY, () => {
    gamepad.mapping = 'standard';
    gamepad.buttons[0].pressed = true;
  }, () => {
    expect(router.input.source).to.equal('gamepad0');
    expect(router.input.name).to.equal('a');
    expect(router.value).to.be.true;
  });

  asyncIt('generates input for button release (standard mapping)', DELAY, () => {
    gamepad.mapping = 'standard';
    gamepad.buttons[1].pressed = true;
  }, () => {
    gamepad.buttons[1].pressed = false;
  }, () => {
    expect(router.input.source).to.equal('gamepad0');
    expect(router.input.name).to.equal('b');
    expect(router.value).to.be.false;
  });

  asyncIt('generates input for axis change from 0 to + (generic mapping)', DELAY, () => {
    gamepad.axes[0] = 0.5;
  }, () => {
    expect(router.input.source).to.equal('gamepad0');
    expect(router.input.name).to.equal('axis-0+');
    expect(router.value).to.be.true;
  });

  asyncIt('generates input for axis change from + to 0 (generic mapping)', DELAY, () => {
    gamepad.axes[1] = 0.5;
  }, () => {
    gamepad.axes[1] = 0.49;
  }, () => {
    expect(router.input.source).to.equal('gamepad0');
    expect(router.input.name).to.equal('axis-1+');
    expect(router.value).to.be.false;
  });

  asyncIt('generates input for axis change from 0 to - (generic mapping)', DELAY, () => {
    gamepad.axes[2] = -0.51;
  }, () => {
    expect(router.input.source).to.equal('gamepad0');
    expect(router.input.name).to.equal('axis-2-');
    expect(router.value).to.be.true;
  });

  asyncIt('generates input for axis change from - to 0 (generic mapping)', DELAY, () => {
    gamepad.axes[3] = -0.51;
  }, () => {
    gamepad.axes[3] = -0.5;
  }, () => {
    expect(router.input.source).to.equal('gamepad0');
    expect(router.input.name).to.equal('axis-3-');
    expect(router.value).to.be.false;
  });

  asyncIt('generates input for axis change from 0 to + (standard mapping)', DELAY, () => {
    gamepad.mapping = 'standard';
    gamepad.axes[0] = 0.5;
  }, () => {
    expect(router.input.source).to.equal('gamepad0');
    expect(router.input.name).to.equal('left-stick-x+');
    expect(router.value).to.be.true;
  });

  asyncIt('generates input for axis change from + to 0 (standard mapping)', DELAY, () => {
    gamepad.mapping = 'standard';
    gamepad.axes[1] = 0.5;
  }, () => {
    gamepad.axes[1] = 0.49;
  }, () => {
    expect(router.input.source).to.equal('gamepad0');
    expect(router.input.name).to.equal('left-stick-y+');
    expect(router.value).to.be.false;
  });

  asyncIt('generates input for axis change from 0 to - (standard mapping)', DELAY, () => {
    gamepad.mapping = 'standard';
    gamepad.axes[2] = -0.51;
  }, () => {
    expect(router.input.source).to.equal('gamepad0');
    expect(router.input.name).to.equal('right-stick-x-');
    expect(router.value).to.be.true;
  });

  asyncIt('generates input for axis change from - to 0 (standard mapping)', DELAY, () => {
    gamepad.mapping = 'standard';
    gamepad.axes[3] = -0.51;
  }, () => {
    gamepad.axes[3] = -0.5;
  }, () => {
    expect(router.input.source).to.equal('gamepad0');
    expect(router.input.name).to.equal('right-stick-y-');
    expect(router.value).to.be.false;
  });

  asyncIt('generates 2 inputs for axis change from - to +', DELAY, () => {
    gamepad.axes[0] = -0.51;
  }, () => {
    gamepad.axes[0] = 0.5;
  }, () => {
    expect(router.inputs[1].source).to.equal('gamepad0');
    expect(router.inputs[1].name).to.equal('axis-0-');
    expect(router.values[1]).to.be.false;
    expect(router.inputs[1].source).to.equal('gamepad0');
    expect(router.inputs[2].name).to.equal('axis-0+');
    expect(router.values[2]).to.be.true;
  });

  asyncIt('generates 2 inputs for axis change from + to -', DELAY, () => {
    gamepad.axes[1] = 0.5;
  }, () => {
    gamepad.axes[1] = -0.51;
  }, () => {
    expect(router.inputs[1].source).to.equal('gamepad0');
    expect(router.inputs[1].name).to.equal('axis-1+');
    expect(router.values[1]).to.be.false;
    expect(router.inputs[2].source).to.equal('gamepad0');
    expect(router.inputs[2].name).to.equal('axis-1-');
    expect(router.values[2]).to.be.true;
  });
});
