<restore-controls>
  <p>
    <i class="icon icon-keyboard-o"></i> <a href="javascript:void(0)" onclick={ restore }>Restore default keyboard controls</a>
  </p>
  <script>
    restore() {
      cfxnes.resetOptions('inputDevices', 'inputMapping');
      this.trigger('change');
    }
  </script>
</restore-controls>
