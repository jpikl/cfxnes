<toolbar-run class="btn-group">
    <button class="btn btn-default navbar-btn" title="Hard reset" onclick={ hardReset }>
        <i class="icon icon-power-off"></i>
    </button>
    <button class="btn btn-default navbar-btn" title="Soft reset" onclick={ softReset }>
        <i class="icon icon-repeat"></i>
    </button>
    <button hide={ running } class="btn btn-default btn-run navbar-btn" title="Run" onclick={ start }>
        <i class="icon icon-play"></i>
    </button>
    <button show={ running } class="btn btn-default btn-pause navbar-btn" title="Pause" onclick={ stop }>
        <i class="icon icon-pause"></i>
    </button>
    <script>
        hardReset() {
            cfxnes.hardReset();
        }

        softReset() {
            cfxnes.softReset();
        }

        start() {
            cfxnes.start();
        }

        stop() {
            cfxnes.stop();
        }

        this.on("update", function() {
            this.running = cfxnes.isRunning();
        });

        app.watch("start stop", this, this.update);
    </script>
</toolbar-run>
