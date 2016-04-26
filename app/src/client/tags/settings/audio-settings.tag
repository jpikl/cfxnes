<audio-settings>
  <div class="audio-settings">
    <div riot-tag="input-checkbox" name="audio-enabled" label="Enable audio"></div>
  </div>
  <div class="audio-settings">
    <div riot-tag="input-slider" name="audio-volume" label="Master Volume" min="0" orientation="vertical" max="1" step="0.01" format="%"></div>
    <div riot-tag="input-slider" name="pulse-1-volume" label="Pulse channel 1" orientation="vertical" min="0" max="1" step="0.01" format="%"></div>
    <div riot-tag="input-slider" name="pulse-2-volume" label="Pulse channel 2" orientation="vertical" min="0" max="1" step="0.01" format="%"></div>
    <div riot-tag="input-slider" name="triangle-volume" label="Triangle channel" orientation="vertical" min="0" max="1" step="0.01" format="%"></div>
    <div riot-tag="input-slider" name="noise-volume" label="Noise channel" orientation="vertical" min="0" max="1" step="0.01" format="%"></div>
    <div riot-tag="input-slider" name="dmc-volume" label="DMC channel" orientation="vertical" min="0" max="1" step="0.01" format="%"></div>
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
      this.tags['audio-enabled'].setValue(cfxnes.isAudioEnabled());
      this.tags['audio-volume'].setValue(cfxnes.getAudioVolume());
      this.tags['pulse-1-volume'].setValue(cfxnes.getAudioChannelVolume('pulse1'));
      this.tags['pulse-2-volume'].setValue(cfxnes.getAudioChannelVolume('pulse2'));
      this.tags['triangle-volume'].setValue(cfxnes.getAudioChannelVolume('triangle'));
      this.tags['noise-volume'].setValue(cfxnes.getAudioChannelVolume('noise'));
      this.tags['dmc-volume'].setValue(cfxnes.getAudioChannelVolume('dmc'));
      this.updateEnablement();
    });

    this.on('mount', function() {
      this.tags['audio-enabled'].on('change', function(value) {
        cfxnes.setAudioEnabled(value);
        this.parent.updateEnablement();
      });
      this.tags['audio-volume'].on('change', function(value) {
        cfxnes.setAudioVolume(value);
      });
      this.tags['pulse-1-volume'].on('change', function(value) {
        cfxnes.setAudioChannelVolume('pulse1', value);
      });
      this.tags['pulse-2-volume'].on('change', function(value) {
        cfxnes.setAudioChannelVolume('pulse2', value);
      });
      this.tags['triangle-volume'].on('change', function(value) {
        cfxnes.setAudioChannelVolume('triangle', value);
      });
      this.tags['noise-volume'].on('change', function(value) {
        cfxnes.setAudioChannelVolume('noise', value);
      });
      this.tags['dmc-volume'].on('change', function(value) {
        cfxnes.setAudioChannelVolume('dmc', value);
      });
      this.tags['audio-volume'].on('mount', function(value) {
        this.parent.updateEnablement();
      });
    });
  </script>
</audio-settings>
