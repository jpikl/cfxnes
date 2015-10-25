<panel-group class="panel-group">
  <yield/>
  <script>
    this.on('mount', function() {
      var panelId = opts['open-panel'];
      if (panelId) {
        $(this.root).find('#' + panelId).addClass('in');
        this.trigger('open', panelId);
      }
      var self = this;
      this.tags['collapse-panel'].forEach(function(panel) {
        panel.on('open', function() {
          self.trigger('open', panel.opts['panel-id']);
        });
      });
    });
  </script>
</panel-group>
