<audio-settings>
  <div class="audio-settings">
    <div riot-tag="input-slider" name="audio-volume" label="Volume" min="0" max="1" step="0.01" format="%"></div>
  </div>
  <div class="audio-settings">
    <div riot-tag="input-checkbox" name="audio-enabled" label="Enable audio"></div>
  </div>
  <div class="audio-settings">
    <div riot-tag="input-checkbox" name="pulse-1-enabled" label="Enable pulse channel 1"></div>
    <div riot-tag="input-checkbox" name="pulse-2-enabled" label="Enable pulse channel 2"></div>
    <div riot-tag="input-checkbox" name="triangle-enabled" label="Enable triangle channel"></div>
  </div>
  <div class="audio-settings">
    <div riot-tag="input-checkbox" name="noise-enabled" label="Enable noise channel"></div>
    <div riot-tag="input-checkbox" name="dmc-enabled" label="Enable DMC channel"></div>
  </div>
  <script>
    updateEnablement() {
      var supported = cfxnes.isAudioSupported();
      var enabled = cfxnes.isAudioEnabled();
      for (var name in this.tags) {
        this.tags[name].setEnabled(supported && (enabled || name === 'audio-enabled'));
      }
    }

    this.on('update', function() {
      this.tags['audio-volume'].setValue(cfxnes.getAudioVolume());
      this.tags['audio-enabled'].setValue(cfxnes.isAudioEnabled());
      this.tags['pulse-1-enabled'].setValue(cfxnes.isAudioChannelEnabled('pulse1'));
      this.tags['pulse-2-enabled'].setValue(cfxnes.isAudioChannelEnabled('pulse2'));
      this.tags['triangle-enabled'].setValue(cfxnes.isAudioChannelEnabled('triangle'));
      this.tags['noise-enabled'].setValue(cfxnes.isAudioChannelEnabled('noise'));
      this.tags['dmc-enabled'].setValue(cfxnes.isAudioChannelEnabled('dmc'));
      this.updateEnablement();
    });

    this.on('mount', function() {
      this.tags['audio-volume'].on('change', function(value) {
        cfxnes.setAudioVolume(value);
      });
      this.tags['audio-enabled'].on('change', function(value) {
        cfxnes.setAudioEnabled(value);
        this.parent.updateEnablement();
      });
      this.tags['pulse-1-enabled'].on('change', function(value) {
        cfxnes.setAudioChannelEnabled('pulse1', value);
      });
      this.tags['pulse-2-enabled'].on('change', function(value) {
        cfxnes.setAudioChannelEnabled('pulse2', value);
      });
      this.tags['triangle-enabled'].on('change', function(value) {
        cfxnes.setAudioChannelEnabled('triangle', value);
      });
      this.tags['noise-enabled'].on('change', function(value) {
        cfxnes.setAudioChannelEnabled('noise', value);
      });
      this.tags['dmc-enabled'].on('change', function(value) {
        cfxnes.setAudioChannelEnabled('dmc', value);
      });
      this.tags['audio-volume'].on('mount', function(value) {
        this.parent.updateEnablement();
      });
    });
  </script>
</audio-settings>
