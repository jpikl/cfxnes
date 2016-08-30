<controls-settings>
  <div class="device-list">
    <device-setup port="1"></device-setup>
    <device-setup port="2"></device-setup>
  </div>
  <div class="controls-settings">
    <restore-controls></restore-controls>
    <connected-gamepads></connected-gamepads>
    <input-checkbox name="controls-visible" label="Show controls on emulator page"></input-checkbox>
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
  <script type="babel">
    this.on('update', () => {
      this.tags['controls-visible'].setValue(controlsVisible);
      this.tags['device-setup'].forEach(ds => ds.update());
    });

    this.on('mount', () => {
      this.tags['device-setup'].forEach(ds => {
        ds.on('change', this.update);
      });
      this.tags['restore-controls'].on('change', this.update);
      this.tags['connected-gamepads'].on('change', this.update);
      this.tags['controls-visible'].on('change', value => {
        controlsVisible = value;
        controlsOpened = value;
      });
    });
  </script>
</controls-settings>
