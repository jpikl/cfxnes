<reset-settings class="reset-settings">
  <div>
    <progress-button name="reset-settings" title="Reset settings" icon="cog"></progress-button>
    <p>Reset CFxNES settings to defaults.</p>
  </div>
  <div>
    <progress-button name="delete-data" title="Delete game data" icon="trash-o"></progress-button>
    <p>Delete data of all games that support saving (for example
        <em>The Legend of Zelda</em> or <em>Final Fantasy</em>).</p>
  </div>
  <script>
    this.on('mount', function() {
      var resetSettings = this.tags['reset-settings'];
      var deleteData = this.tags['delete-data'];

      resetSettings.on('click', function() {
        resetSettings.setProgress('Reseting settings...');
        app.reset();
        resetSettings.setSuccess('Done');
      });

      deleteData.on('click', function() {
        if (confirm('Delete stored data of all games?')) {
          deleteData.setProgress('Deleting data...');
          cfxnes.deleteNVRAMs().then(function() {
            deleteData.setSuccess('Done');
          }, function(error) {
            console.error(error);
            deleteData.setError('Deletion failed');
          });
        }
      });
    });
  </script>
</reset-settings>
