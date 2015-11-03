<game-tile class="game">
  <a href="#/emulator/{ game.id }">
    <i class="icon icon-play"></i>
    <img src="{ game.thumbnailURL || 'images/cartridge.svg' }">
    { game.name }
  </a>
  <script>
    applyFilter(filter) {
      $(this.root).toggle(this.game.name.toLowerCase().indexOf(filter) >= 0);
    }
  </script>
</game-tile>
