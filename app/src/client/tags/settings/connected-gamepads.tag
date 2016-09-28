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
      const port = target.attr('data-port');
      const index = target.attr('data-index');

      devices[port] = 'joypad';

      mapGamepadInput(port, 'a', index, 'a');
      mapGamepadInput(port, 'b', index, 'b');
      mapGamepadInput(port, 'start', index, 'start');
      mapGamepadInput(port, 'select', index, 'back');
      mapGamepadInput(port, 'up', index, 'dpad-up');
      mapGamepadInput(port, 'down', index, 'dpad-down');
      mapGamepadInput(port, 'left', index, 'dpad-left');
      mapGamepadInput(port, 'right', index, 'dpad-right');

      this.trigger('change');
    };

    function mapGamepadInput(joyPort, joyInput, gpIndex, gpInput) {
      const devInput = `${joyPort}.joypad.${joyInput}`;
      const srcInput = `gamepad${gpIndex}.${gpInput}`;
      inputs.delete(devInput, srcInput);
      inputs.set(devInput, srcInput);
    }
  </script>
</connected-gamepads>
