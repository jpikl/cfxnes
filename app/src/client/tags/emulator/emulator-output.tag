<emulator-output class="emulator-output">
  <div class="fullscreen-wrapper">
    <canvas name="canvas">
      Your browser does not support canvas.
    </canvas>
  </div>
  <span show={ loading } class="inverse loader">Loading...</span>
  <img class="drag-effect" src="images/cartridge-insert.png">
  <script>
    showLoading() {
      this.update({loading: true});
    }

    hideLoading() {
      this.update({loading: false});
    }

    this.on('mount', function() {
      cfxnes.setVideoOutput(this.canvas);
    });

    this.on('unmount', function() {
      cfxnes.setVideoOutput(null);
    });
  </script>
</emulator-output>
