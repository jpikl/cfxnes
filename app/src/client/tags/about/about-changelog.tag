<about-changelog>
  <h2>Change Log</h2>
  <p>Each change is prefixed with code of related module:</p>
  <ul>
    <li><em>core</em> = emulator core</li>
    <li><em>lib</em> = emulation library</li>
    <li><em>app</em> = web application</li>
    <li><em>dbg</em> = debugger</li>
  </ul>
  <h3><a href="https://github.com/jpikl/cfxnes/compare/v0.3.0...HEAD">Unreleased</a></h3>
  <h4>Fixed</h4>
  <ul>
    <li>[core] Detection of NES 2.0 ROM image format.</li>
    <li>[core] Correct size of PRG/CHR RAM that is read from ROM images (iNES / NES 2.0).</li>
    <li>[core] MMC1 mapper imlementation (PRG RAM protection, PRG ROM mapping).</li>
    <li>[core] MMC3 mapper implementation (PRG RAM protection, CHR ROM mapping).</li>
  </ul>
  <h4>Added</h4>
  <ul>
    <li>[core] Support for BNROM and NINA-001 mappers.</li>
    <li>[lib] API to change loggging level.</li>
    <li>[app] Option to reset configuration.</li>
    <li>[app] Option to delete saved game data.</li>
    <li>[dbg] Debugger can take screenshots.</li>
  </ul>
  <h4>Changed</h4>
  <ul>
    <li>[core] Cartridge data (battery backed RAM) is stored in IndexedDB.</li>
    <li>[core, lib] API uses Promises for asynchronous operations.</li>
    <li>[lib, app] Default audio volume is 50%.</li>
  </ul>
  <h3><a href="https://github.com/jpikl/cfxnes/compare/v0.2.0...v0.3.0">0.3.0</a> - 2015-08-09</h3>
  <h4>Fixed</h4>
  <ul>
    <li>[lib] Mouse cursor detection for zapper.</li>
  </ul>
  <h4>Added</h4>
  <ul>
    <li>[lib, app] Gamepad support.</li>
  </ul>
  <h4>Changed</h4>
  <ul>
    <li>[lib] Library can be loaded as AMD or CommonJS module.</li>
    <li>[app] Complete UI rewrite (switched from AngularJS to RiotJS).</li>
    <li>[app] <em>TV system</em> configuration option renamed to <em>Region</em>.</li>
  </ul>
  <h3><a href="https://github.com/jpikl/cfxnes/compare/v0.1.0...v0.2.0">0.2.0</a> - 2015-05-18</h3>
  <h4>Fixed</h4>
  <ul>
    <li>[core] MMC3 mapper initial state (SMB3 and Shadow of the Ninja games are now playable).</li>
    <li>[core] Compatibility with Babel compiler (v5.4.3).</li>
    <li>[core, lib] Compatibility with Closure Compiler (v20150505).</li>
    <li>[lib, app] Emulator initialization in Internet Explorer.</li>
  </ul>
  <h3>Added</h3>
  <ul>
    <li>[core] Support for loading of zipped <code>.nes</code> files.</li>
    <li>[app] Visual effect when dropping files into browser window.</li>
    <li>[app] Option to hide FPS counter.</li>
    <li>[app] Favicon.</li>
  </ul>
  <h4>Changed</h4>
  <ul>
    <li>[core, lib] js-md5 and screenfull library are optional dependencies.</li>
    <li>[app] UI optimization for small screens.</li>
  </ul>
  <h3>0.1.0 - 2015-04-26</h3>
  <ul>
    <li>Complete rewrite from CoffeeScript to ECMAScript 6.</li>
  </ul>
</about-changelog>