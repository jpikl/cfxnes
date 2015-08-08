<toolbar-size class="btn-group">
    <button name="scaleMinus" class="btn btn-default navbar-btn { disabled: isMinScale }" title="Decrease scale" onclick={ decreaseScale }>
        <i class="icon icon-search-minus"></i>
    </button>
    <button name="scalePlus" class="btn btn-default navbar-btn { disabled: isMaxScale }" title="Increase scale" onclick={ increaseScale }>
        <i class="icon icon-search-plus"></i>
    </button>
    <button class="btn btn-default navbar-btn" title="Fullscreen" onclick={ enterFullScreen }>
        <i class="icon icon-arrows-alt"></i>
    </button>
    <script>
        decreaseScale() {
            cfxnes.setVideoScale(Math.max(cfxnes.getVideoScale() - 1, 1));
        }

        increaseScale() {
            cfxnes.setVideoScale(Math.min(cfxnes.getVideoScale() + 1, cfxnes.getMaxVideoScale()));
        }

        enterFullScreen() {
            cfxnes.enterFullScreen();
        }

        this.on("update", function() {
            this.isMinScale = cfxnes.getVideoScale() <= 1;
            this.isMaxScale = cfxnes.getVideoScale() >= cfxnes.getMaxVideoScale();
        });
    </script>
</toolbar-size>
