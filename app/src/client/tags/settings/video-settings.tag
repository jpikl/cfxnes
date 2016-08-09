<video-settings>
  <div class="video-settings">
    <div riot-tag="input-number" name="video-scale" label="Output scale" min="1" max={ maxVideoScale }></div>
    <div riot-tag="input-select" name="video-palette" label="Color palette" options={ videoPalettes }></div>
    <div riot-tag="input-select" name="fullscreen-mode" label="Type of full screen mode" options={ fullscreenTypes }></div>
  </div>
  <div class="video-settings">
    <div riot-tag="input-checkbox" name="video-smoothing" label="Enable smoothing"></div>
    <div riot-tag="input-checkbox" name="video-debug" label="Show patterns and paletts"></div>
    <div riot-tag="input-checkbox" name="video-webgl" label="Use WebGL for rendering"></div>
    <div riot-tag="input-checkbox" name="fps-visible" label="Show FPS"></div>
  </div>
  <script type="babel">
    this.maxVideoScale = ~~cfxnes.getMaxVideoScale();

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

    this.fullscreenTypes = [
      {value: 'maximized', label: 'Upscale to maximum resolution'},
      {value: 'normalized', label: 'Upscale without visual artifacts'},
      {value: 'stretched', label: 'Stretch to fill the whole sceen'},
    ];

    this.on('update', () => {
      this.tags['video-scale'].setValue(cfxnes.getVideoScale());
      this.tags['video-palette'].setValue(cfxnes.getVideoPalette());
      this.tags['fullscreen-mode'].setValue(cfxnes.getFullscreenType());
      this.tags['video-smoothing'].setValue(cfxnes.isVideoSmoothing());
      this.tags['video-debug'].setValue(cfxnes.isVideoDebug());
      this.tags['video-webgl'].setValue(cfxnes.getVideoRenderer() === 'webgl');
      this.tags['fps-visible'].setValue(app.fpsVisible);
    });

    this.on('mount', () => {
      this.tags['video-scale'].on('change', value => cfxnes.setVideoScale(value));
      this.tags['video-palette'].on('change', value => cfxnes.setVideoPalette(value));
      this.tags['fullscreen-mode'].on('change', value => cfxnes.setFullscreenType(value));
      this.tags['video-smoothing'].on('change', value => cfxnes.setVideoSmoothing(value));
      this.tags['video-debug'].on('change', value => cfxnes.setVideoDebug(value));
      this.tags['video-webgl'].on('change', value => cfxnes.setVideoRenderer(value ? 'webgl' : 'canvas'));
      this.tags['fps-visible'].on('change', value => (app.fpsVisible = value));
    });
  </script>
</video-settings>
