<device-setup class="device">
  <div riot-tag="device-select" port={ port }></div>
  <div if={ device == 'joypad' }>
    <div riot-tag="device-input" input="{ port }.joypad.a" label="A"></div>
    <div riot-tag="device-input" input="{ port }.joypad.b" label="B"></div>
    <div riot-tag="device-input" input="{ port }.joypad.start" label="Start"></div>
    <div riot-tag="device-input" input="{ port }.joypad.select" label="Select"></div>
    <div riot-tag="device-input" input="{ port }.joypad.left" label="Left"></div>
    <div riot-tag="device-input" input="{ port }.joypad.right" label="Right"></div>
    <div riot-tag="device-input" input="{ port }.joypad.up" label="Up"></div>
    <div riot-tag="device-input" input="{ port }.joypad.down" label="Down"></div>
  </div>
  <div if={ device == 'zapper' }>
    <div riot-tag="device-input" input="{ port }.zapper.trigger" label="Trigger"></div>
  </div>
  <script>
    this.port = parseInt(opts.port);

    change() {
      this.trigger('change');
    }

    this.on('update', function() {
      this.device = cfxnes.getInputDevice(this.port);
    });

    this.on('mount', function() {
      this.tags['device-select'].on('change', this.change);
      this.tags['device-input'].forEach(function(deviceInput) {
        deviceInput.on('change', deviceInput.parent.change);
      });
    });
  </script>
</device-setup>
