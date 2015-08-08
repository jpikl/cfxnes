<video-settings>
    <div class="video-settings">
        <div riot-tag="input-number" name="video-scale" label="Output scale" min="1" max={ maxVideoScale } value={ videoScale }></div>
        <div riot-tag="input-select" name="video-palette" label="Color palette" options={ videoPalettes } value={ videoPalette }></div>
    </div>
    <div class="video-settings">
        <div riot-tag="input-checkbox" name="video-smoothing" label="Enable smoothing" value={ videoSmoothing }></div>
        <div riot-tag="input-checkbox" name="video-debugging" label="Show patterns and paletts" value={ videoDebugging }></div>
        <div riot-tag="input-checkbox" name="video-webgl" label="Use WebGL for rendering" value={ videoWebGL }></div>
        <div riot-tag="input-checkbox" name="fps-enabled" label="Show FPS" value={ fpsEnabled }></div>
    </div>
    <script>
        this.maxVideoScale = cfxnes.getMaxVideoScale();
        this.videoScale = cfxnes.getVideoScale();
        this.videoPalettes = [
            {value: "default", label: "Default"},
            {value: "bright", label: "Bright"},
            {value: "realistic", label: "Realistic"},
        ];
        this.videoPalette = cfxnes.getVideoPalette();
        this.videoSmoothing = cfxnes.isVideoSmoothing();
        this.videoDebugging = cfxnes.isVideoDebugging();
        this.videoWebGL = cfxnes.getVideoRenderer() === "webgl";
        this.fpsEnabled = app.fpsEnabled;

        this.on("mount", function() {
            this.tags["video-scale"].on("change", function(value) {
                cfxnes.setVideoScale(value);
            });
            this.tags["video-palette"].on("change", function(value) {
                cfxnes.setVideoPalette(value);
            });
            this.tags["video-smoothing"].on("change", function(value) {
                cfxnes.setVideoSmoothing(value);
            });
            this.tags["video-debugging"].on("change", function(value) {
                cfxnes.setVideoDebugging(value);
            });
            this.tags["video-webgl"].setEnabled(cfxnes.isVideoRendererSupported("webgl"));
            this.tags["video-webgl"].on("change", function(value) {
                cfxnes.setVideoRenderer(value ? "webgl" : "canvas");
            });
            this.tags["fps-enabled"].on("change", function(value) {
                app.fpsEnabled = value;
                app.save();
            });
        });
    </script>
</video-settings>
