<audio-settings>
  <div class="audio-settings">
    <div riot-tag="input-checkbox" name="audio-enabled" label="Enable audio"></div>
  </div>
  <div class="audio-settings">
    <div riot-tag="input-slider" name="master-volume" label="Master Volume" min="0" orientation="vertical" max="1" step="0.01" format="%"></div>
    <div riot-tag="input-slider" name="pulse1-volume" label="Pulse Channel 1" min="0" orientation="vertical" max="1" step="0.01" format="%"></div>
    <div riot-tag="input-slider" name="pulse2-volume" label="Pulse Channel 2" min="0" orientation="vertical" max="1" step="0.01" format="%"></div>
    <div riot-tag="input-slider" name="triangle-volume" label="Triangle Channel" min="0" orientation="vertical" max="1" step="0.01" format="%"></div>
    <div riot-tag="input-slider" name="noise-volume" label="Noise Channel" min="0" orientation="vertical" max="1" step="0.01" format="%"></div>
    <div riot-tag="input-slider" name="dmc-volume" label="DMC Channel" min="0" orientation="vertical" max="1" step="0.01" format="%"></div>
  </div>
  <script type="babel">
    const channels = ['master', 'pulse1', 'pulse2', 'triangle', 'noise', 'dmc'];

    this.updateEnablement = () => {
      const supported = cfxnes.isAudioSupported();
      const enabled = cfxnes.isAudioEnabled();
      for (const name in this.tags) {
        this.tags[name].setEnabled(supported && (enabled || name === 'audio-enabled'));
      }
    };

    this.on('update', () => {
      this.tags['audio-enabled'].setValue(cfxnes.isAudioEnabled());
      for (const channel of channels) {
        this.tags[`${channel}-volume`].setValue(cfxnes.getAudioVolume(channel));
      }
      this.updateEnablement();
    });

    this.on('mount', () => {
      this.tags['audio-enabled'].on('change', value => cfxnes.setAudioEnabled(value));
      this.tags['audio-enabled'].on('mount change', this.updateEnablement);
      for (const channel of channels) {
        this.tags[`${channel}-volume`].on('change', value => cfxnes.setAudioVolume(channel, value));
      }
    });
  </script>
</audio-settings>
