<device-select class="device-select">
  <label>Controller&nbsp;{ opts.port }</label>
  <div class="btn-group">
    <button each={ device in devices } class="btn btn-default { active: device.value == value }" value={ device.value } onclick={ onChange }>{ device.label }</button>
  </div>
  <script type="babel">
    this.devices = [
      {value: 'none', label: 'None'},
      {value: 'joypad', label: 'Joypad'},
      {value: 'zapper', label: 'Zapper'},
    ];

    this.onChange = event => {
      let value = event.target.value;
      if (value === 'none') {
        value = null;
      }
      devices[opts.port] = value;
      this.trigger('change', value);
    };

    this.on('update', () => {
      this.value = devices[opts.port];
    });
  </script>
</device-select>
