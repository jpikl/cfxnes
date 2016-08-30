<controls-info class="alert alert-info alert-dismissible" show={ opened }>
  <button type="button" class="close" onclick={ close }>
    <span>&times;</span>
  </button>
  <h3>Controls <small>(<a class="alert-link" href="#/settings/controls"><i class="icon icon-wrench"></i> configure</a>)</small></h3>
  <table>
    <tr riot-tag="controls-row" input="1.joypad.a" label="A"></tr>
    <tr riot-tag="controls-row" input="1.joypad.b" label="B"></tr>
    <tr riot-tag="controls-row" input="1.joypad.start" label="Start"></tr>
    <tr riot-tag="controls-row" input="1.joypad.select" label="Select"></tr>
    <tr riot-tag="controls-row" input="1.joypad.left" label="Left"></tr>
    <tr riot-tag="controls-row" input="1.joypad.right" label="Right"></tr>
    <tr riot-tag="controls-row" input="1.joypad.up" label="Up"></tr>
    <tr riot-tag="controls-row" input="1.joypad.down" label="Down"></tr>
    <tr riot-tag="controls-row" input="2.zapper.trigger" label="Zapper"></tr>
  </table>
  <script type="babel">
    this.opened = controlsOpened && controlsVisible;

    this.close = () => {
      this.opened = controlsOpened = false;
    };
  </script>
</controls-info>
