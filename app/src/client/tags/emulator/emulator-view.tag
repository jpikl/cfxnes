<emulator-view class="emulator">
  <div class="emulator-error">
    <message-panel></message-panel>
  </div>
  <div class="emulator-controls">
    <controls-info></controls-info>
  </div>
  <dnd-wrapper class="emulator-main">
    <emulator-output></emulator-output>
  </dnd-wrapper>
  <input riot-tag="input-file" id="input-file">
  <script type="babel">
    let message;
    let output;

    this.resume = gameId => {
      if (gameId && gameId !== lastGameId) {
        this.load(gameId);
      } else if (autoPaused) {
        this.start();
      } else if (rom.loaded) {
        nes.step(); // To refresh the output
      }
    };

    this.suspend = () => {
      autoPaused = nes.running;
      this.stop();
    };

    this.start = () => {
      nes.start();
      bus.trigger('start');
    };

    this.stop = () => {
      nes.stop();
      bus.trigger('stop');
    };

    this.load = source => {
      let gameId = null;

      if (typeof source === 'string') {
        gameId = source;
        this.stop();
        output.showLoading();
        message.hide();
      }

      saveNVRAM()
        .then(() => {
          if (!gameId) {
            return rom.load(source);
          }
          return $.get('/roms/' + gameId).then(data => {
            return rom.load(data.file);
          });
        })
        .catch(error => {
          output.hideLoading();
          message.showError(formatError(error));
          throw error;
        })
        .then(loadNVRAM)
        .then(() => {
          lastGameId = gameId;
          output.hideLoading();
          message.hide();
          this.start();
        })
        .catch(logError);
    };

    this.on('mount', () => {
      this.tags['input-file'].on('fileopen', this.load);
      this.tags['dnd-wrapper'].on('filedrop', this.load);

      message = this.tags['message-panel'];
      output = this.tags['dnd-wrapper'].tags['emulator-output'];
      output.on('mount', () => this.resume(viewParam));
    });

    this.on('unmount', this.suspend);
  </script>
</emulator-view>
