<toolbar-open class="btn-group">
  <button name="button" class="btn btn-default navbar-btn" title="Open ROM" onclick={ onClick }>
    <i class="icon icon-folder-open"></i>
  </button>
  <script type="babel">
    this.onClick = () => {
      $('#input-file').click(); // Placed in emulator-view
    };
  </script>
</toolbar-open>
