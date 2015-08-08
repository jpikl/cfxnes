<emulation-settings class="emulation-settings">
    <div riot-tag="input-select" name="region" label="Region" options={ regions } value={ region }></div>
    <div riot-tag="input-slider" name="speed", label="Emulation speed" min="0.25" max="2" step="0.25" format="x" value={ speed }></div>
    <script>
        this.regions = [
            {value: "auto", label: "Autodetect"},
            {value: "ntsc", label: "NTSC"},
            {value: "pal", label: "PAL"},
        ];
        this.region = cfxnes.getRegion() || "auto";
        this.speed = cfxnes.getSpeed();

        this.on("mount", function() {
            this.tags["region"].on("change", function(value) {
                cfxnes.setRegion(value);
            });
            this.tags["speed"].on("change", function(value) {
                cfxnes.setSpeed(value);
            });
        });
    </script>
</emulation-settings>
