<library-view class="library">
  <div class="library-section">
    <h1>Library</h1>
  </div>
  <div class="library-section">
    <div>
      <message-panel></message-panel>
      <loader-indicator if={ !games }></loader-indicator>
    </div>
    <div riot-tag="input-search" if={ games && games.length } placeholder="Search games" focus={ desktop } value={ filter }></div>
  </div>
  <div class="library-section" if={ games && games.length  }>
    <ul class="game-list">
      <li each={ game in games } riot-tag="game-tile" game={ game }></li>
    </ul>
  </div>
  <script type="babel">
    this.desktop = $.browser.desktop;

    this.setFilter = filter => {
      this.filter = gameFilter = filter;
    };

    this.applyFilter = () => {
      const filter = this.filter.trim().toLowerCase();
      eachTag(this.tags['game-tile'], tile => {
        tile.applyFilter(filter);
      });
    };

    this.setFilter(viewParam || gameFilter || '');

    this.on('mount', () => {
      const message = this.tags['message-panel'];

      this.tags['input-search'].on('change', value => {
        this.setFilter(value);
        this.applyFilter();
      });

      $.get('/roms/').done(games => {
        this.games = games;
        if (!games.length) {
          message.showInfo('There are no games available.');
        }
      })
      .fail(response => {
        this.games = [];
        message.showError(formatError(response));
      })
      .always(this.update);
    });

    this.on('updated', this.applyFilter);
  </script>
</library-view>
