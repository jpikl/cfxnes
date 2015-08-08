<app-nav class="navbar navbar-default">
    <div class="container-fluid">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target=".navbar-collapse">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="#/emulator">
                <img src="images/logo.svg"> CFxNES
            </a>
        </div>
        <div class="navbar-collapse collapse">
            <ul class="nav navbar-nav navbar-left">
                <li riot-tag="nav-button" view="emulator" title="Emulator" icon="gamepad"></li>
                <li riot-tag="nav-button" view="library" title="Game Library" icon="book"></li>
                <li riot-tag="nav-button" view="settings" title="Settings" icon="cog"></li>
            </ul>
            <div id="toolbar"></div>
            <ul class="nav navbar-nav navbar-right">
                <li riot-tag="nav-button" view="about" title="About" icon="question-circle"></li>
            </ul>
        </div>
    </div>
    <script>
        var toolbar;

        app.watch("route", this, function(view) {
            toolbar && toolbar.unmount(true);
            toolbar = riot.mount("#toolbar", view + "-toolbar")[0];
        });
    </script>
</app-nav>
