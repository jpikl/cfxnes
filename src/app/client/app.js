//=========================================================
// CFxNES setup
//=========================================================

var CFxNES = require("cfxnes");

cfxnes = new CFxNES({
    hash: require("js-md5"),
    jszip: require("jszip"),
    screenfull: require("screenfull"),
    loggingLevel: "all",
    loadOnStart: true,
    saveOnClose: true,
    savePeriod: 60, // sec
    storage: "local"
});

//=========================================================
// UI dependencies
//=========================================================

$ = jQuery = require("jquery");
require("jquery.browser");
require("bootstrap");
require("bootstrap-slider");
riot = require("riot");

//=========================================================
// Application state
//=========================================================

app = riot.observable({
    gameFilter: "",
    fpsEnabled: localStorage["fpsEnabled"] !== "false",
    controlsInfoEnabled: localStorage["controlsInfoEnabled"] !== "false",
    controlsInfoVisible: true,
    save: function() {
        localStorage["controlsInfoEnabled"] = this.controlsInfoEnabled ? "true" : "false";
        localStorage["fpsEnabled"] = this.fpsEnabled ? "true" : "false";
    },
    route: function(view, param) {
        app.trigger("route", view, param);
    },
    watch: function(events, tag, callback) {
        callback = callback.bind(tag);
        tag.on("mount", this.on.bind(this, events, callback));
        tag.on("unmount", this.off.bind(this, events, callback));
    }
});

//=========================================================
// Utilities
//=========================================================

eachTag = function(tags, callback) {
    if (tags != null) {
        if (tags.length == null) {
            callback(tags); // Single tag
        } else {
            tags.forEach(callback);
        }
    }
}

//=========================================================
// RiotJS setup
//=========================================================

riot.route.parser(function(path) {
    if (path.length && path[path.length - 1] === "/") {
        path = path.substring(0, path.length - 1);
    }
    var parts = path.split("/").splice(1);
    return parts.length > 0 ? parts : [ "emulator" ];
});
riot.route(app.route);

//=========================================================
// Tags
//=========================================================

require("./tags/about/about-changelog.tag");
require("./tags/about/about-view.tag");
require("./tags/common/collapse-panel.tag");
require("./tags/common/dnd-wrapper.tag");
require("./tags/common/input-checkbox.tag");
require("./tags/common/input-file.tag");
require("./tags/common/input-number.tag");
require("./tags/common/input-search.tag");
require("./tags/common/input-select.tag");
require("./tags/common/input-slider.tag");
require("./tags/common/message-panel.tag");
require("./tags/common/panel-group.tag");
require("./tags/emulator/controls-info.tag");
require("./tags/emulator/controls-row.tag");
require("./tags/emulator/emulator-output.tag");
require("./tags/emulator/emulator-toolbar.tag");
require("./tags/emulator/emulator-view.tag");
require("./tags/emulator/fps-counter.tag");
require("./tags/emulator/toolbar-open.tag");
require("./tags/emulator/toolbar-run.tag");
require("./tags/emulator/toolbar-size.tag");
require("./tags/emulator/toolbar-volume.tag");
require("./tags/library/game-tile.tag");
require("./tags/library/library-view.tag");
require("./tags/navbar/app-nav.tag");
require("./tags/navbar/nav-button.tag");
require("./tags/settings/audio-settings.tag");
require("./tags/settings/connected-gamepads.tag");
require("./tags/settings/controls-settings.tag");
require("./tags/settings/device-input.tag");
require("./tags/settings/device-select.tag");
require("./tags/settings/device-setup.tag");
require("./tags/settings/emulation-settings.tag");
require("./tags/settings/restore-defaults.tag");
require("./tags/settings/settings-view.tag");
require("./tags/settings/video-settings.tag");
require("./tags/app-main.tag");

//=========================================================
// Mount
//=========================================================

$(document).ready(function() {
    riot.mount("*");
    riot.route.exec(app.route);
});
