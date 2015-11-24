<fps-counter class="navbar-text">
  <span if={ visible }>FPS: { fps }</span>
  <script>
    this.on('update', function() {
      this.visible = app.fpsVisible && cfxnes.isRunning()
      this.fps = ~~cfxnes.getFPS();
    });

    this.on('mount', function() {
      this.refreshId = setInterval(this.update, 1000);
    });

    this.on('unmount', function() {
      clearInterval(this.refreshId);
    });
  </script>
</fps-counter>
