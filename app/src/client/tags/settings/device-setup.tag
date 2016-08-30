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
  <script type="babel">
    this.port = parseInt(opts.port);

    this.on('update', () => {
      this.device = devices[this.port];
    });

    this.on('mount', () => {
      this.tags['device-select'].on('change', () => {
        this.trigger('change');
      });
      this.tags['device-input'].forEach(di => {
        di.on('change', () => this.trigger('change'));
      });
    });
  </script>
</device-setup>
