<device-setup class="device">
  <div riot-tag="device-select" port={ port }></div>
  <div if={ device == 'joypad' }>
    <div riot-tag="device-input" port={ port } device="joypad" input="a" input-name="A"></div>
    <div riot-tag="device-input" port={ port } device="joypad" input="b" input-name="B"></div>
    <div riot-tag="device-input" port={ port } device="joypad" input="start" input-name="Start"></div>
    <div riot-tag="device-input" port={ port } device="joypad" input="select" input-name="Select"></div>
    <div riot-tag="device-input" port={ port } device="joypad" input="left" input-name="Left"></div>
    <div riot-tag="device-input" port={ port } device="joypad" input="right" input-name="Right"></div>
    <div riot-tag="device-input" port={ port } device="joypad" input="up" input-name="Up"></div>
    <div riot-tag="device-input" port={ port } device="joypad" input="down" input-name="Down"></div>
  </div>
  <div if={ device == 'zapper' }>
    <div riot-tag="device-input" port={ port } device="zapper" input="trigger" input-name="Trigger"></div>
  </div>
  <script>
    this.port = parseInt(this.opts.port);

    change() {
      this.trigger('change');
    }

    this.on('mount', function() {
      this.tags['device-select'].on('change', this.change);
      this.tags['device-input'].forEach(function(deviceInput) {
        deviceInput.on('change', deviceInput.parent.change);
      });
    });

    this.on('update', function() {
      this.device = cfxnes.getInputDevice(this.port);
    });
  </script>
</device-setup>
