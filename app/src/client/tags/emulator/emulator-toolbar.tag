<emulator-toolbar>
  <div class="toolbar nav navbar-nav navbar-left ng-scope">
    <toolbar-open></toolbar-open>
    <toolbar-run></toolbar-run>
    <toolbar-size></toolbar-size>
    <toolbar-volume></toolbar-volume>
  </div>
  <fps-counter></fps-counter>
  <script>
    this.on('mount', function() {
      $(this.root).find('button').tooltip({
        placement: 'bottom',
        trigger: 'hover',
        animation: false,
        container: 'body'
      });
    });
  </script>
</emulator-toolbar>
