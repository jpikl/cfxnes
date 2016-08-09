<toolbar-volume dropdown="dropdown" class="btn-group dropdown">
  <button type="button" class="btn btn-default navbar-btn dropdown-toggle" title="Volume" data-toggle="dropdown">
    <span class="icon-stack volume-icon">
      <i if={ volume > 0.5 } class="icon-stack-1x icon icon-volume-up"></i>
      <i if={ volume > 0 && volume <= 0.5 } class="icon-stack-1x icon icon-volume-down"></i>
      <i if={ volume == 0 } class="icon-stack-1x icon icon-volume-off"></i>
      <i if={ !enabled } class="icon-stack-1x icon icon-ban"></i>
    </span>
  </button>
  <div name="dropdown" class="dropdown-menu volume-dropdown">
    <input type="checkbox" name="checkbox" title="Enable audio" checked={ enabled } onclick={ toggleEnabled }>
    <input type="text" name="slider">
  </div>
  <script type="babel">
    this.toggleEnabled = () => {
      cfxnes.setAudioEnabled(!cfxnes.isAudioEnabled());
      $(this.slider).slider('toggle');
    };

    this.on('update', () => {
      this.enabled = cfxnes.isAudioEnabled();
      this.volume = cfxnes.getAudioVolume();
    });

    this.on('mount', () => {
      $(this.dropdown).click(event => {
        event.stopPropagation(); // Disable accidental dropdown closing
      });
      $(this.checkbox).tooltip({
        placement: 'right',
        trigger: 'hover',
        animation: false,
        container: 'body',
      });
      $(this.slider).slider({
        min: 0,
        max: 1,
        step: 0.01,
        orientation: 'vertical',
        reversed: true,
        selection: 'after',
        enabled: cfxnes.isAudioEnabled(),
        value: cfxnes.getAudioVolume(),
        formatter: value => ~~(100 * value) + '%',
      }).on('change', event => {
        cfxnes.setAudioVolume(event.value.newValue);
        this.update();
      });
    });
  </script>
</toolbar-volume>
