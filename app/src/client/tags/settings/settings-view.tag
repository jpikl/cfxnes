<settings-view class="settings">
  <h1>Settings</h1>
  <div riot-tag="panel-group" id="settings-group" open-panel-id={ panelId }>
    <div riot-tag="collapse-panel" panel-id="emulation-settings" label="Emulation" icon="server">
      <emulation-settings></emulation-settings>
    </div>
    <div riot-tag="collapse-panel" panel-id="video-settings" label="Video" icon="desktop">
      <video-settings></video-settings>
    </div>
    <div if={ audio } riot-tag="collapse-panel" panel-id="audio-settings" label="Audio" icon="music">
      <audio-settings></audio-settings>
    </div>
    <div riot-tag="collapse-panel" panel-id="controls-settings" label="Controls" icon="gamepad">
      <controls-settings></controls-settings>
    </div>
    <div riot-tag="collapse-panel" panel-id="reset-settings" label="Reset" icon="trash-o">
      <reset-settings name='reset-settings'></reset-settings>
    </div>
  </div>
  <script type="babel">
    this.panelId = (viewParam || settingsPanel || 'emulation') + '-settings';

    this.on('mount', () => {
      this.tags['panel-group'].on('open', panelId => {
        settingsPanel = panelId.substring(0, panelId.indexOf('-'));
      });
    });
  </script>
</settings-view>
