<reset-settings class="reset-settings">
  <div>
    <progress-button name="reset-settings" title="Reset settings" icon="cog"></progress-button>
    <p>Reset cfxnes settings to defaults.</p>
  </div>
  <div>
    <progress-button name="delete-data" title="Delete game data" icon="trash-o"></progress-button>
    <p>Delete data of games that support saving (for example
        <em>The Legend of Zelda</em> or <em>Final Fantasy</em>).</p>
  </div>
  <script type="babel">
    this.on('mount', () => {
      this.tags['reset-settings'].on('click', function() {
        this.setProgress('Reseting settings...');
        fpsVisible = true;
        controlsVisible = true;
        controlsOpened = true;
        config.use(defaults);
        this.setSuccess('Done');
      });

      this.tags['delete-data'].on('click', function() {
        if (confirm('Delete stored data of all games?')) {
          this.setProgress('Deleting data...');
          clearNVRAM().then(() => {
            this.setSuccess('Done');
          }, error => {
            logError(error);
            this.setError('Deletion failed');
          });
        }
      });
    });
  </script>
</reset-settings>
