<restore-controls>
  <p>
    <i class="icon icon-keyboard-o"></i> <a href="javascript:void(0)" onclick={ restore }>Restore default keyboard controls</a>
  </p>
  <script type="babel">
    this.restore = () => {
      options.reset('devices', 'inputs');
      this.trigger('change');
    };
  </script>
</restore-controls>
