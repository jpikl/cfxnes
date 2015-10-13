<video-settings>
  <div class="video-settings">
    <div riot-tag="input-number" name="video-scale" label="Output scale" min="1" max={ maxVideoScale }></div>
    <div riot-tag="input-select" name="video-palette" label="Color palette" options={ videoPalettes }></div>
  </div>
  <div class="video-settings">
    <div riot-tag="input-checkbox" name="video-smoothing" label="Enable smoothing"></div>
    <div riot-tag="input-checkbox" name="video-debugging" label="Show patterns and paletts"></div>
    <div riot-tag="input-checkbox" name="video-webgl" label="Use WebGL for rendering"></div>
    <div riot-tag="input-checkbox" name="fps-enabled" label="Show FPS"></div>
  </div>
  <script>
    this.maxVideoScale = cfxnes.getMaxVideoScale();
    this.videoPalettes = [
      {value: 'default', label: 'Default'},
      {value: 'bright', label: 'Bright'},
      {value: 'realistic', label: 'Realistic'},
    ];

    refresh() {
      this.tags['video-scale'].setValue(cfxnes.getVideoScale());
      this.tags['video-palette'].setValue(cfxnes.getVideoPalette());
      this.tags['video-smoothing'].setValue(cfxnes.isVideoSmoothing());
      this.tags['video-debugging'].setValue(cfxnes.isVideoDebugging());
      this.tags['video-webgl'].setValue(cfxnes.getVideoRenderer() === 'webgl');
      this.tags['fps-enabled'].setValue(app.fpsEnabled);
    }

    this.on('mount', function() {
      this.tags['video-scale'].on('change', function(value) {
        cfxnes.setVideoScale(value);
      });
      this.tags['video-palette'].on('change', function(value) {
        cfxnes.setVideoPalette(value);
      });
      this.tags['video-smoothing'].on('change', function(value) {
        cfxnes.setVideoSmoothing(value);
      });
      this.tags['video-debugging'].on('change', function(value) {
        cfxnes.setVideoDebugging(value);
      });
      this.tags['video-webgl'].setEnabled(cfxnes.isVideoRendererSupported('webgl'));
      this.tags['video-webgl'].on('change', function(value) {
        cfxnes.setVideoRenderer(value ? 'webgl' : 'canvas');
      });
      this.tags['fps-enabled'].on('change', function(value) {
        app.fpsEnabled = value;
        app.save();
      });
      this.refresh();
    });
  </script>
</video-settings>
