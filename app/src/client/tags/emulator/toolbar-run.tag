<toolbar-run class="btn-group">
  <button class="btn btn-default navbar-btn" title="Power" onclick={ nes.power }>
    <i class="icon icon-power-off"></i>
  </button>
  <button class="btn btn-default navbar-btn" title="Reset" onclick={ nes.reset }>
    <i class="icon icon-repeat"></i>
  </button>
  <button hide={ nes.running } class="btn btn-default btn-run navbar-btn" title="Run" onclick={ nes.start }>
    <i class="icon icon-play"></i>
  </button>
  <button show={ nes.running } class="btn btn-default btn-pause navbar-btn" title="Pause" onclick={ nes.stop }>
    <i class="icon icon-pause"></i>
  </button>
  <script type="babel">
    this.on('mount', () => bus.on('start stop', this.update));
    this.on('unmount', () => bus.off('start stop', this.update));
  </script>
</toolbar-run>
