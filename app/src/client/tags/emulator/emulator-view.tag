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
      this.tags['input-file'].on('fileopen', loadCartridge);
      this.tags['dnd-wrapper'].on('filedrop', loadCartridge);

      messagePanel = this.tags['message-panel'];
      emulatorOutput = this.tags['dnd-wrapper'].tags['emulator-output'];
      emulatorOutput.on('mount', function() {
        resumeEmulator(app.viewParam);
      });
    });

    this.on('unmount', suspendEmulator);

    function resumeEmulator(gameId) {
      if (gameId && gameId !== app.gameId) {
        downloadCartridge(gameId);
      } else if (app.autoPaused) {
        startEmulator();
      } else if (cfxnes.isCartridgeInserted()) {
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

    function downloadCartridge(gameId) {
      emulatorOutput.showLoading();
      messagePanel.hide();
      cfxnes.removeCartridge().then(function() {
        stopEmulator();
        return Promise.resolve($.get('/roms/' + gameId));
      }).then(function(data) {
        return cfxnes.downloadCartridge(data.fileURL);
      }).then(onLoad.bind(null, gameId), onError);
    }

    function loadCartridge(file) {
      cfxnes.loadCartridge(file).then(onLoad, onError);
    }

    function onLoad(gameId) {
      app.gameId = gameId;
      emulatorOutput.hideLoading();
      messagePanel.hide();
      startEmulator();
    }

    function onError(error) {
      console.error(error);
      emulatorOutput.hideLoading();
      messagePanel.showError(getErrorMessage(error));
    }
  </script>
</emulator-view>
