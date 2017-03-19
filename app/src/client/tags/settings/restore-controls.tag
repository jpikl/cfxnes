<restore-controls>
  <p>
    <i class="icon icon-keyboard-o"></i> <a href="javascript:void(0)" onclick={ restore }>Restore default keyboard controls</a>
  </p>
  <script type="babel">
    this.restore = () => {
      Object.assign(devices, defaults.devices);
      nes.config.use({inputs: defaults.inputs});
      this.trigger('change');
    };
  </script>
</restore-controls>
