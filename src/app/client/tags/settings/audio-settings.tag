<audio-settings>
  <div class="audio-settings">
    <div riot-tag="input-slider" name="audio-volume" label="Volume" min="0" max="1" step="0.01" format="%" value={ audioVolume }></div>
  </div>
  <div class="audio-settings">
    <div riot-tag="input-checkbox" name="audio-enabled" label="Enable audio" value={ audioEnabled }></div>
  </div>
  <div class="audio-settings">
    <div riot-tag="input-checkbox" name="pulse-1-enabled" label="Enable pulse channel 1" value={ pulse1Enabled }></div>
    <div riot-tag="input-checkbox" name="pulse-2-enabled" label="Enable pulse channel 2" value={pulse2Enabled  }></div>
    <div riot-tag="input-checkbox" name="triangle-enabled" label="Enable triangle channel" value={ triangleEnabled }></div>
  </div>
  <div class="audio-settings">
    <div riot-tag="input-checkbox" name="noise-enabled" label="Enable noise channel" value={ noiseEnabled }></div>
    <div riot-tag="input-checkbox" name="dmc-enabled" label="Enable DMC channel" value={ dmcEnabled }></div>
  </div>
  <script>
    this.audioVolume = cfxnes.getAudioVolume();
    this.audioEnabled = cfxnes.isAudioEnabled();
    this.pulse1Enabled = cfxnes.isAudioChannelEnabled('pulse1');
    this.pulse2Enabled = cfxnes.isAudioChannelEnabled('pulse2');
    this.triangleEnabled = cfxnes.isAudioChannelEnabled('triangle');
    this.noiseEnabled = cfxnes.isAudioChannelEnabled('noise');
    this.dmcEnabled = cfxnes.isAudioChannelEnabled('dmc');

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

    updateEnablement() {
      var supported = cfxnes.isAudioSupported();
      var enabled = cfxnes.isAudioEnabled();
      for (var name in this.tags) {
        this.tags[name].setEnabled(supported && (enabled || name === 'audio-enabled'));
      }
    }
  </script>
</audio-settings>
