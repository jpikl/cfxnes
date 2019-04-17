import React from 'react';

export default () => (
  <div>
    <h2>Changelog</h2>
    <h3>Unreleased</h3>
    <ul>
      <li>Fixed unrecoverable state after ROM with unsupported mapper is loaded.</li>
    </ul>
    <h3>0.7.0 - <time>2019-04-04</time></h3>
    <ul>
      <li>Fixed no sound due to Chrome autoplay policy.</li>
      <li>Added overlay for paused emulator.</li>
      <li>Added loading transition.</li>
      <li>Better colors of controls info panel for dark theme.</li>
      <li>No autoplay when app is started directly from emulator page.</li>
    </ul>
    <h3>0.6.0 - <time>2017-11-22</time></h3>
    <ul>
      <li>Fixed error when loading certain iNES ROMs (<i>Donkey Kong 3</i>) due to being detected as NES 2.0.</li>
      <li>Added home screen.</li>
      <li>Added keyboard shortcuts.</li>
      <li>Added light and dark theme.</li>
      <li>Added option to change mouse cursor to crosshair.</li>
      <li>Added option to bind multiple keys/buttons to the same input.</li>
      <li>Added new color palettes: SONY CXA2025AS US, Unsaturated V6.</li>
      <li><b>Server</b>: Added configuration through file or environment variables.</li>
      <li><b>Server</b>: Added  gzip Content-Encoding support.</li>
      <li>Complete UI rewrite in React/Redux.</li>
      <li><i>WebGL rendering</i> video option replaced by <i>Renderer</i> select.</li>
      <li><i>Smoothing</i> video option replaced by <i>Filter</i> select.</li>
      <li><i>Joypad</i> device renamed to <i>Controller</i>.</li>
      <li>Cleaner URL paths without hash mark <code>#</code>.</li>
      <li>Active settings panel is part of URL.</li>
      <li>Active library item no longer disappears from URL.</li>
      <li>Controls info panel displays devices and key bindings for both ports.</li>
      <li>Closing controls info panel will toggle corresponding configuration option.</li>
      <li>Library is no longer being reinitialized every time it is displayed.</li>
      <li>Better (more responsive) header UI.</li>
      <li>Better confirmation dialogs.</li>
    </ul>
    <h3>0.5.0 - <time>2016-09-29</time></h3>
    <ul>
      <li>Fixed delayed IRQ response after CLI/SEI/PLP (<i>Break Time</i> is now playable).</li>
      <li>Fixed MMC3 mapper alternate behavior.</li>
      <li>Fixed sprite overflow flag clearing.</li>
      <li>Fixed sprite zero hit detection.</li>
      <li>Fixed disabled audio in Safari.</li>
      <li>Added option to set independent volume of each audio channel.</li>
      <li>Added warning message for disabled JavaScript.</li>
      <li>Checksums are computed using SHA-1 from PRG RAM and CHR RAM.</li>
    </ul>
    <h3>0.4.0 - <time>2015-11-29</time></h3>
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
      <li><i>Game Library</i> renamed to <i>Library</i>.</li>
      <li>Only a single reload when multiple files are changed in library directory.</li>
      <li>Non-volatile RAM is stored in IndexedDB.</li>
      <li>Vector graphics used where possible.</li>
      <li>Default audio volume is 50%.</li>
    </ul>
    <h3>0.3.0 - <time>2015-08-09</time></h3>
    <ul>
      <li>Fixed mouse cursor detection for Zapper.</li>
      <li>Fixed SVG images scaling in Internet Explorer.</li>
      <li>Added gamepad support.</li>
      <li>Complete UI rewrite in Riot.js.</li>
      <li><i>TV system</i> option renamed to <i>Region</i>.</li>
      <li>Input files with size over 10MB are rejected.</li>
    </ul>
    <h3>0.2.0 - <time>2015-05-18</time></h3>
    <ul>
      <li>Fixed MMC3 mapper initial state (<i>SMB3</i> and <i>Shadow of the Ninja</i> are now playable).</li>
      <li>Fixed initialization in Internet Explorer.</li>
      <li>Added support for loading of zipped <code>.nes</code> files.</li>
      <li>Added option to hide FPS counter.</li>
      <li>Added drag &apos;n&apos; drop visual effect.</li>
      <li>Added favicon.</li>
      <li>UI optimization for small screens.</li>
    </ul>
    <h3>0.1.0 - <time>2015-04-26</time></h3>
    <ul>
      <li>Initial version.</li>
    </ul>
  </div>
);
