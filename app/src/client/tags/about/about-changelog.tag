<about-changelog>
  <h2>Changelog</h2>
  <h3>0.5.0 - 2016-09-29</h3>
  <ul>
    <li>Fixed delayed IRQ response after CLI/SEI/PLP (<em>Break Time</em> is now playable).</li>
    <li>Fixed MMC3 mapper alternate behavior.</li>
    <li>Fixed sprite overflow flag clearing.</li>
    <li>Fixed sprite zero hit detection.</li>
    <li>Fixed disabled audio in Safari.</li>
    <li>Added option to set independent volume of each audio channel.</li>
    <li>Added warning message for disabled JavaScript.</li>
    <li>Checksums are computed using SHA-1 from PRG RAM and CHR RAM.</li>
  </ul>
  <h3>0.4.0 - 2015-11-29</h3>
  <ul>
    <li>Fixed detection of NES 2.0 ROM image format.</li>
    <li>Fixed size of PRG/CHR RAM read from ROM images (iNES / NES 2.0).</li>
    <li>Fixed MMC1 mapper implementation (PRG RAM protection, PRG ROM mapping).</li>
    <li>Fixed MMC3 mapper implementation (PRG RAM protection, CHR ROM mapping).</li>
    <li>Fixed crash during attempt to load invalid configuration.</li>
    <li>Added support for BNROM, NINA-001 and Color Dreams mappers.</li>
    <li>Added new color palettes: ASQ, BMF, FCEU(X), Nestopia.</li>
    <li>Added multiple types of fullscreen mode.</li>
    <li>Added option to reset configuration.</li>
    <li>Added option to delete saved NVRAM data.</li>
    <li><em>Game Library</em> renamed to <em>Library</em>.</li>
    <li>Only a single reload when multiple files are changed in library directory.</li>
    <li>Non-volatile RAM is stored in IndexedDB.</li>
    <li>Vector graphics used where possible.</li>
    <li>Default audio volume is 50%.</li>
  </ul>
  <h3>0.3.0 - 2015-08-09</h3>
  <ul>
    <li>Fixed mouse cursor detection for Zapper.</li>
    <li>Fixed SVG images scaling in Internet Explorer.</li>
    <li>Added gamepad support.</li>
    <li>Complete UI rewrite in Riot.js.</li>
    <li><em>TV system</em> option renamed to <em>Region</em>.</li>
    <li>Input files with size over 10MB are rejected.</li>
  </ul>
  <h3>0.2.0 - 2015-05-18</h3>
  <ul>
    <li>Fixed MMC3 mapper initial state (<em>SMB3</em> and <em>Shadow of the Ninja</em> are now playable).</li>
    <li>Fixed initialization in Internet Explorer.</li>
    <li>Added support for loading of zipped <code>.nes</code> files.</li>
    <li>Added option to hide FPS counter.</li>
    <li>Added drag 'n' drop visual effect.</li>
    <li>Added favicon.</li>
    <li>UI optimization for small screens.</li>
  </ul>
  <h3>0.1.0 - 2015-04-26</h3>
  <ul>
    <li>Initial version.</li>
  </ul>
</about-changelog>
