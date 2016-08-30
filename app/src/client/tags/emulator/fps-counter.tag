<fps-counter class="navbar-text">
  <span if={ fpsVisible && nes.running }>FPS: { ~~nes.fps }</span>
  <script type="babel">
    this.on('mount', () => {
      this.refreshId = setInterval(this.update, 1000);
    });

    this.on('unmount', () => {
      clearInterval(this.refreshId);
    });
  </script>
</fps-counter>
