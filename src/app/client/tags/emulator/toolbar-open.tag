<toolbar-open class="btn-group">
    <button name="button" class="btn btn-default navbar-btn" title="Open ROM" onclick={ openROM }>
        <i class="icon icon-folder-open"></i>
    </button>
    <script>
        openROM() {
            $("#input-file").click(); // Placed in emulator-view
        }
    </script>
</toolbar-open>
