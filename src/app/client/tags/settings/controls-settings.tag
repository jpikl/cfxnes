<controls-settings>
  <div class="device-list">
    <device-setup port="1"></device-setup>
    <device-setup port="2"></device-setup>
  </div>
  <div class="controls-settings">
    <restore-controls></restore-controls>
    <connected-gamepads></connected-gamepads>
    <input-checkbox name="controls-info-enabled" label="Show controls on emulator page" value={ controlsInfoEnabled }></input-checkbox>
  </div>
  <div id="record-input-modal" class="modal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-body">
          Press key or button (ESC to cancel)
        </div>
      </div>
    </div>
  </div>
  <script>
    this.controlsInfoEnabled = app.controlsInfoEnabled;

    this.on('mount', function() {
      this.tags['device-setup'].forEach(function(deviceSetup) {
        deviceSetup.on('change', deviceSetup.parent.refresh);
      });
      this.tags['restore-controls'].on('change', this.refresh);
      this.tags['connected-gamepads'].on('change', this.refresh);
      this.tags['controls-info-enabled'].on('change', function(value) {
        app.controlsInfoEnabled = value;
        app.save();
      });
    });

    refresh() {
      this.tags['device-setup'].forEach(function(deviceSetup) {
        deviceSetup.update();
      });
    }
  </script>
</controls-settings>
