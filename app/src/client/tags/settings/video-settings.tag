<video-settings>
  <div class="video-settings">
    <div riot-tag="input-number" name="video-scale" label="Output scale" min="1" max={ maxVideoScale }></div>
    <div riot-tag="input-select" name="video-palette" label="Color palette" options={ videoPalettes }></div>
    <div riot-tag="input-select" name="fullscreen-mode" label="Full screen mode" options={ fullscreenModes }></div>
  </div>
  <div class="video-settings">
    <div riot-tag="input-checkbox" name="video-smoothing" label="Enable smoothing"></div>
    <div riot-tag="input-checkbox" name="video-debugging" label="Show patterns and paletts"></div>
    <div riot-tag="input-checkbox" name="video-webgl" label="Use WebGL for rendering"></div>
    <div riot-tag="input-checkbox" name="fps-visible" label="Show FPS"></div>
  </div>
  <script>
    this.maxVideoScale = cfxnes.getMaxVideoScale();
    this.videoPalettes = [
      {value: 'asq-real-a', label: 'ASQ (reality A)'},
      {value: 'asq-real-b', label: 'ASQ (reality B)'},
      {value: 'bmf-fin-r2', label: 'BMF (final revision 2)'},
      {value: 'bmf-fin-r3', label: 'BMF (final revision 3)'},
      {value: 'fceu-13', label: 'FCEU .13'},
      {value: 'fceu-15', label: 'FCEU .15'},
      {value: 'fceux', label: 'FCEUX'},
      {value: 'nestopia-rgb', label: 'Nestopia (RGB)'},
      {value: 'nestopia-yuv', label: 'Nestopia (YUV)'},
    ];
    this.fullscreenModes = [
      {value: 'keep-aspect-ratio', label: 'Keep aspect ratio'},
      {value: 'fill-screen', label: 'Fill screen'},
      {value: 'fill-screen|keep-aspect-ratio', label: 'Fill screen + Keep aspect ratio'},
    ];

    this.on('update', function() {
      this.tags['video-scale'].setValue(cfxnes.getVideoScale());
      this.tags['video-palette'].setValue(cfxnes.getVideoPalette());
      this.tags['fullscreen-mode'].setValue(cfxnes.getFullscreenMode());
      this.tags['video-smoothing'].setValue(cfxnes.isVideoSmoothing());
      this.tags['video-debugging'].setValue(cfxnes.isVideoDebugging());
      this.tags['video-webgl'].setValue(cfxnes.getVideoRenderer() === 'webgl');
      this.tags['fps-visible'].setValue(app.fpsVisible);
    });

    this.on('mount', function() {
      this.tags['video-scale'].on('change', function(value) {
        cfxnes.setVideoScale(value);
      });
      this.tags['video-palette'].on('change', function(value) {
        cfxnes.setVideoPalette(value);
      });
      this.tags['fullscreen-mode'].on('change', function(value) {
        cfxnes.setFullscreenMode(value);
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
      this.tags['fps-visible'].on('change', function(value) {
        app.fpsVisible = value;
      });
    });
  </script>
</video-settings>
