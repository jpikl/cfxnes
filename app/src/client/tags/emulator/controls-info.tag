<controls-info class="alert alert-info alert-dismissible" show={ visible }>
  <button type="button" class="close" onclick={ hide }>
    <span>&times;</span>
  </button>
  <h3>Controls <small>(<a class="alert-link" href="#/settings/controls"><i class="icon icon-wrench"></i> configure</a>)</small></h3>
  <table>
    <tr riot-tag="controls-row" device="joypad" input="a" input-name="A"></tr>
    <tr riot-tag="controls-row" device="joypad" input="b" input-name="B"></tr>
    <tr riot-tag="controls-row" device="joypad" input="start" input-name="Start"></tr>
    <tr riot-tag="controls-row" device="joypad" input="select" input-name="Select"></tr>
    <tr riot-tag="controls-row" device="joypad" input="left" input-name="Left"></tr>
    <tr riot-tag="controls-row" device="joypad" input="right" input-name="Right"></tr>
    <tr riot-tag="controls-row" device="joypad" input="up" input-name="Up"></tr>
    <tr riot-tag="controls-row" device="joypad" input="down" input-name="Down"></tr>
    <tr riot-tag="controls-row" device="zapper" input="trigger" input-name="Zapper"></tr>
  </table>
  <script>
    this.visible = app.controlsInfoVisible && app.controlsInfoEnabled;

    hide() {
      this.visible = app.controlsInfoVisible = false;
    }
  </script>
</controls-info>
