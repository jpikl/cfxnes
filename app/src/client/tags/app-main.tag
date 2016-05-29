<app-main>
  <div class="main-content">
    <div id="view"></div>
  </div>
  <script type="babel">
    let view;

    this.setView = name => {
      if (view) view.unmount(true);
      view = riot.mount('#view', `${name}-view`)[0];
    };

    this.on('mount', () => app.on('route', this.setView));
    this.on('unmount', () => app.off('route', this.setView));
  </script>
</app-main>
