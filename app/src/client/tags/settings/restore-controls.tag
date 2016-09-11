<restore-controls>
  <p>
    <i class="icon icon-keyboard-o"></i> <a href="javascript:void(0)" onclick={ restore }>Restore default keyboard controls</a>
  </p>
  <script type="babel">
    this.restore = () => {
      devices[1] = defaultDevice1;
      devices[2] = defaultDevice2;
      inputs.set(defaultInputs);
      this.trigger('change');
    };
  </script>
</restore-controls>
