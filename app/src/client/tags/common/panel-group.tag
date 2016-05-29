<panel-group class="panel-group">
  <yield/>
  <script type="babel">
    this.on('mount', () => {
      const openPanelId = opts.openPanelId;
      if (openPanelId) {
        $(this.root).find('#' + openPanelId).addClass('in');
        this.trigger('open', openPanelId);
      }
      this.tags['collapse-panel'].forEach(panel => {
        panel.on('open', () => {
          this.trigger('open', panel.opts.panelId);
        });
      });
    });
  </script>
</panel-group>
