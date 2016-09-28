<toolbar-size class="btn-group">
  <button name="scaleMinus" class="btn btn-default navbar-btn { disabled: !canDecrease }" title="Decrease scale" onclick={ decrease }>
    <i class="icon icon-search-minus"></i>
  </button>
  <button name="scalePlus" class="btn btn-default navbar-btn { disabled: !canIncrease }" title="Increase scale" onclick={ increase }>
    <i class="icon icon-search-plus"></i>
  </button>
  <button class="btn btn-default navbar-btn" title="Fullscreen" onclick={ fullscreen.enter }>
    <i class="icon icon-arrows-alt"></i>
  </button>
  <script type="babel">
    this.decrease = () => {
      if (this.canDecrease) {
        video.scale--;
      }
    };

    this.increase = () => {
      if (this.canIncrease) {
        video.scale++;
      }
    };

    this.on('update', () => {
      this.canDecrease = video.scale > 1;
      this.canIncrease = video.scale < maxVideoScale;
    });
  </script>
</toolbar-size>
