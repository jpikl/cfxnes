<emulation-settings class="emulation-settings">
  <div riot-tag="input-select" name="region" label="Region" options={ regions }></div>
  <div riot-tag="input-slider" name="speed", label="Emulation speed" min="0.25" max="2" step="0.25" format="x"></div>
  <script type="babel">
    this.regions = [
      {value: 'auto', label: 'Autodetect'},
      {value: 'ntsc', label: 'NTSC'},
      {value: 'pal', label: 'PAL'},
    ];

    this.on('update', () => {
      this.tags['region'].setValue(nes.region);
      this.tags['speed'].setValue(nes.speed);
    });

    this.on('mount', () => {
      this.tags['region'].on('change', value => { nes.region = value; });
      this.tags['speed'].on('change', value => { nes.speed = value; });
    });
  </script>
</emulation-settings>
