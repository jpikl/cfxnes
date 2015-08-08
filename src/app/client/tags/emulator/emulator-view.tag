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

        this.on("mount", function() {
            this.tags["input-file"].on("fileopen", loadCartridge);
            this.tags["dnd-wrapper"].on("filedrop", loadCartridge);

            messagePanel = this.tags["message-panel"];
            emulatorOutput = this.tags["dnd-wrapper"].tags["emulator-output"];
            emulatorOutput.on("mount", function() {
                riot.route.exec(function(view, gameId) {
                    resumeEmulator(gameId);
                });
            });
        });

        this.on("unmount", suspendEmulator);

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
            app.trigger("start");
        }

        function stopEmulator() {
            cfxnes.stop();
            app.trigger("stop");
        }

        function downloadCartridge(gameId) {
            beforeLoad();
            var url = "/roms/" + gameId;
            $.get(url).done(function(data) {
                cfxnes.downloadCartridge(data.fileURL, onLoad.bind(null, gameId), onError);
            }).fail(function(response) {
                onError("Unable to download '" + url + "' (server response: " + response.status + ").");
            });
        }

        function loadCartridge(file) {
            cfxnes.loadCartridge(file, onLoad, onError);
        }

        function beforeLoad() {
            emulatorOutput.showLoading();
            messagePanel.hide();
            cfxnes.removeCartridge();
            stopEmulator();
        }

        function onLoad(gameId) {
            app.gameId = gameId;
            emulatorOutput.hideLoading();
            messagePanel.hide();
            startEmulator();
        }

        function onError(error) {
            emulatorOutput.hideLoading();
            messagePanel.showError(error);
        }
    </script>
</emulator-view>
