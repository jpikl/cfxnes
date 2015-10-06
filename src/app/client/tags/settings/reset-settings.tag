<reset-settings class="reset-settings">
  <div>
    <progress-button name="reset-settings" title="Reset settings" icon="cog"></progress-button>
    <p>Reset CFxNES settings to defaults.</p>
  </div>
  <div>
    <progress-button name="delete-data" title="Delete game data" icon="trash-o"></progress-button>
    <p>Delete data of all games that supports saving (for example
        <em>The Legend of Zelda</em> or <em>Final Fantasy</em>).</p>
  </div>
  <script>
    this.on('mount', function() {
      var resetSettings = this.tags['reset-settings'];
      var deleteData = this.tags['delete-data'];

      resetSettings.on('click', function() {
        resetSettings.setProgress('Reseting settings...');
        cfxnes.resetConfiguration().then(function() {
          resetSettings.setSuccess('Done');
        }, function(error) {
          resetSettings.setError(error.message || 'Reset failed');
        });
      });

      deleteData.on('click', function() {
        if (confirm('Delete stored data of all games?')) {
          deleteData.setProgress('Deleting data...');
          cfxnes.deleteAllCartridgeData().then(function() {
            deleteData.setSuccess('Done');
          }, function(error) {
            deleteData.setError(error.message || 'Deletion failed');
          });
        }
      });
    });
  </script>
</reset-settings>
