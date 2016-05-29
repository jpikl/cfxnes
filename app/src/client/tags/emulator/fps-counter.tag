<fps-counter class="navbar-text">
  <span if={ visible }>FPS: { fps }</span>
  <script type="babel">
    this.on('update', () => {
      this.visible = app.fpsVisible && cfxnes.isRunning();
      this.fps = ~~cfxnes.getFPS();
    });

    this.on('mount', () => {
      this.refreshId = setInterval(this.update, 1000);
    });

    this.on('unmount', () => {
      clearInterval(this.refreshId);
    });
  </script>
</fps-counter>
