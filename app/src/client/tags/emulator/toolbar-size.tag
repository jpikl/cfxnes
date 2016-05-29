<toolbar-size class="btn-group">
  <button name="scaleMinus" class="btn btn-default navbar-btn { disabled: isMinScale }" title="Decrease scale" onclick={ decreaseScale }>
    <i class="icon icon-search-minus"></i>
  </button>
  <button name="scalePlus" class="btn btn-default navbar-btn { disabled: isMaxScale }" title="Increase scale" onclick={ increaseScale }>
    <i class="icon icon-search-plus"></i>
  </button>
  <button class="btn btn-default navbar-btn" title="Fullscreen" onclick={ enterFullscreen }>
    <i class="icon icon-arrows-alt"></i>
  </button>
  <script type="babel">
    this.decreaseScale = () => {
      if (!this.isMinScale) {
        cfxnes.setVideoScale(cfxnes.getVideoScale() - 1);
      }
    };

    this.increaseScale = () => {
      if (!this.isMaxScale) {
        cfxnes.setVideoScale(cfxnes.getVideoScale() + 1);
      }
    };

    this.enterFullscreen = () => {
      cfxnes.enterFullscreen();
    };

    this.on('update', () => {
      this.isMinScale = cfxnes.getVideoScale() <= 1;
      this.isMaxScale = cfxnes.getVideoScale() >= ~~cfxnes.getMaxVideoScale();
    });
  </script>
</toolbar-size>
