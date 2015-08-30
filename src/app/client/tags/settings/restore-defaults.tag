<restore-defaults>
  <p>
    <i class="icon icon-keyboard-o"></i> <a href="javascript:void(0)" onclick={ restore }>Restore default keyboard layout</a>
  </p>
  <script>
    restore() {
      cfxnes.setInputDefaults();
      this.trigger('change');
    }
  </script>
</restore-defaults>
