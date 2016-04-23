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
  <script>
    var messagePanel;
    var emulatorOutput;

    this.on('mount', function() {
      this.tags['input-file'].on('fileopen', loadGame);
      this.tags['dnd-wrapper'].on('filedrop', loadGame);

      messagePanel = this.tags['message-panel'];
      emulatorOutput = this.tags['dnd-wrapper'].tags['emulator-output'];
      emulatorOutput.on('mount', function() {
        resumeEmulator(app.viewParam);
      });
    });

    this.on('unmount', suspendEmulator);

    function resumeEmulator(gameId) {
      if (gameId && gameId !== app.gameId) {
        loadGame(gameId);
      } else if (app.autoPaused) {
        startEmulator();
      } else if (cfxnes.isROMLoaded()) {
        cfxnes.step(); // To refresh the output
      }
    }

    function suspendEmulator() {
      app.autoPaused = cfxnes.isRunning();
      stopEmulator();
    }

    function startEmulator() {
      cfxnes.start();
      app.trigger('start');
    }

    function stopEmulator() {
      cfxnes.stop();
      app.trigger('stop');
    }

    function loadGame(source) {
      var gameId = typeof source === 'string' ? source : null;
      if (gameId) {
        stopEmulator();
        emulatorOutput.showLoading();
        messagePanel.hide();
      }

      cfxnes.saveNVRAM()
        .catch(logError)
        .then(function() {
          if (!gameId) {
            return cfxnes.loadROM(source);
          }
          return $.get('/roms/' + gameId).then(function(data) {
            return cfxnes.loadROM(data.fileURL);
          });
        })
        .catch(function(error) {
          emulatorOutput.hideLoading();
          messagePanel.showError(getErrorMessage(error));
          throw error;
        })
        .then(function() {
          return cfxnes.loadNVRAM().catch(logError);
        })
        .then(function() {
          app.gameId = gameId;
          emulatorOutput.hideLoading();
          messagePanel.hide();
          startEmulator();
        })
        .catch(logError);
    }
  </script>
</emulator-view>
