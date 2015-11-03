<emulator-output class="emulator-output">
  <div class="canvas-wrapper">
    <canvas name="canvas">
      Your browser does not support canvas.
    </canvas>
    <img class="drag-effect" src="images/cartridge-insert.svg">
    <loader show={ loading } inverse="true"></loader>
  </div>
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
