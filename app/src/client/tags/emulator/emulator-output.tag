<emulator-output class="emulator-output">
  <div class="canvas-wrapper">
    <canvas name="canvas"></canvas>
    <img class="drag-effect" src="images/cartridge-insert.svg">
    <loader-indicator show={ loading } inverse="true"></loader-indicator>
  </div>
  <script type="babel">
    this.showLoading = () => {
      this.update({loading: true});
    };

    this.hideLoading = () => {
      this.update({loading: false});
    };

    this.on('mount', () => {
      video.output = this.canvas;
    });

    this.on('unmount', () => {
      video.output = null;
    });
  </script>
</emulator-output>
