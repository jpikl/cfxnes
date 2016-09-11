<connected-gamepads>
  <p if={ message }>
    <i class="icon icon-gamepad"></i> { message }
  </p>
  <p each={ gamepads }>
    <i class="icon icon-gamepad"></i> Gamepad { index }: { id }
    <span if={ mapping == 'standard' }>
      <i class="icon icon-wrench"></i> use it as
      <a href="#" data-index={ index } data-port="1" onclick={ mapGamepad }>controller 1</a> /
      <a href="#" data-index={ index } data-port="2" onclick={ mapGamepad }>controller 2</a>
    </span>
    <span if={ mapping != 'standard' } title="Auto-mapping functionality is not available, because your browser could not recognise layout of the gamepad.">
      <i class="icon icon-question"></i> unrecognised layout
    </span>
  <p>
  <script type="babel">
    if (navigator.getGamepads) {
      this.on('update', () => {
        this.gamepads = [];
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
          if (gamepads[i]) {
            this.gamepads.push(gamepads[i]);
          }
        }
        this.message = this.gamepads.length ? null
          : 'No gamepads seem to be connected. Plug in a gamepad and then press any of its buttons to activate it.';
      });

      this.on('mount', () => {
        this.refreshId = setInterval(this.update, 500);
      });

      this.on('unmount', () => {
        clearInterval(this.refreshId);
      });
    } else {
      this.message = 'Your browser does not seem to support gamepads.';
    }

    this.mapGamepad = event => {
      const target = $(event.target);
      const index = target.attr('data-index');
      const port = target.attr('data-port');

      devices[port] = 'joypad';
      inputs.set(`${port}.joypad.a`, `gamepad${index}.a`);
      inputs.set(`${port}.joypad.b`, `gamepad${index}.b`);
      inputs.set(`${port}.joypad.start`, `gamepad${index}.start`);
      inputs.set(`${port}.joypad.select`, `gamepad${index}.back`);
      inputs.set(`${port}.joypad.up`, `gamepad${index}.dpad-up`);
      inputs.set(`${port}.joypad.down`, `gamepad${index}.dpad-down`);
      inputs.set(`${port}.joypad.left`, `gamepad${index}.dpad-left`);
      inputs.set(`${port}.joypad.right`, `gamepad${index}.dpad-right`);

      this.trigger('change');
    };
  </script>
</connected-gamepads>
