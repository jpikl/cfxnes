<library-view class="library">
  <div class="library-section">
    <h1>Game Library</h1>
  </div>
  <div class="library-section">
    <div>
      <message-panel></message-panel>
      <loader if={ !games }></loader>
    </div>
    <div riot-tag="input-search" if={ games && games.length } placeholder="Search games" focus={ desktop } value={ filter }></div>
  </div>
  <div class="library-section" if={ games && games.length  }>
    <ul class="game-list">
      <li each={ game in games } riot-tag="game-tile" game={ game }></li>
    </ul>
  </div>
  <script>
    var self = this;
    this.desktop = $.browser.desktop;

    setFilter(filter) {
      this.filter = app.gameFilter = filter;
    }

    applyFilter() {
      var filter = this.filter.trim().toLowerCase();
      eachTag(this.tags['game-tile'], function(gameTile) {
        gameTile.applyFilter(filter);
      });
    }

    riot.route.exec(function(view, param) {
      self.setFilter(param || app.gameFilter);
    });

    this.on('mount', function() {
      var messagePanel = this.tags['message-panel'];

      this.tags['input-search'].on('change', function(value) {
        self.setFilter(value);
        self.applyFilter();
      });

      $.get('/roms/').done(function(games) {
        self.games = games;
        if (!games.length) {
          messagePanel.showInfo('There are no games available.');
        }
      }).fail(function(response) {
        self.games = [];
        messagePanel.showError(getErrorMessage(response));
      }).always(function() {
        self.update();
      });
    });

    this.on('updated', this.applyFilter);
  </script>
</library-view>
