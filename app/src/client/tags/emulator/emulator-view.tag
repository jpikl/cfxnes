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
      if (gameId && gameId !== app.gameId) {
        this.load(gameId);
      } else if (app.autoPaused) {
        this.start();
      } else if (cfxnes.isROMLoaded()) {
        cfxnes.step(); // To refresh the output
      }
    };

    this.suspend = () => {
      app.autoPaused = cfxnes.isRunning();
      this.stop();
    };

    this.start = () => {
      cfxnes.start();
      app.trigger('start');
    };

    this.stop = () => {
      cfxnes.stop();
      app.trigger('stop');
    };

    this.load = source => {
      const gameId = typeof source === 'string' ? source : null;
      if (gameId) {
        this.stop();
        output.showLoading();
        message.hide();
      }

      cfxnes.saveNVRAM()
        .catch(logError)
        .then(() => {
          if (!gameId) {
            return cfxnes.loadROM(source);
          }
          return $.get('/roms/' + gameId).then(data => {
            return cfxnes.loadROM(data.file);
          });
        })
        .catch(error => {
          output.hideLoading();
          message.showError(formatError(error));
          throw error;
        })
        .then(() => {
          return cfxnes.loadNVRAM().catch(logError);
        })
        .then(() => {
          app.gameId = gameId;
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
      output.on('mount', () => this.resume(app.viewParam));
    });

    this.on('unmount', this.suspend);
  </script>
</emulator-view>
