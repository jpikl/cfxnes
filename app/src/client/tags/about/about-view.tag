<about-view class="about">
  <div class="about-section">
    <div class="about-logo">
      <img src="images/logo.svg" alt="cfxnes logo">
    </div>
    <div class="about-text">
      <h1>cfxnes ({ cfxnes.version })</h1>
      <p>JavaScript NES emulator and emulation library.</p>
      <p>The source code is available at <a href="https://github.com/jpikl/cfxnes">github</a> and licensed under the MIT License.</p>
      <p>Copyright © 2014-2016 Jan Pikl</p>
      <a href="" hide={ changelogVisible } onclick={ showChangelog }>Show change log</a>
      <about-changelog show={ changelogVisible }></about-changelog>
    </div>
  </div>
  <script type="babel">
    this.showChangelog = () => {
      this.changelogVisible = true;
    };
  </script>
</about-view>
