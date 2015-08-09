<about-view class="about">
    <div class="about-section">
        <div class="about-logo">
            <img src="images/logo.svg" alt="CFxNES logo">
        </div>
        <div class="about-text">
            <h1>CFxNES (0.3.0)</h1>
            <p>A Nintendo Entertainment System emulator written in ECMAScript 6.</p>
            <p>CFxNES is in early development, so many of the NES games are not playable yet. For best berformance,
               at least 2 GHz CPU and the <strong>latest Google Chrome</strong> or <strong>Firefox</strong> are recommended.</p>
            <p>The source code is available at <a href="https://github.com/jpikl/cfxnes">github</a> and licensed under the MIT License.</p>
            <p>Copyright © 2014-2015 Jan Pikl</p>
            <a href="" hide={ changelogVisible } onclick={ showChangelog }>Show change log</a>
            <about-changelog show={ changelogVisible }></about-changelog>
        </div>
    </div>
    <script>
        showChangelog() {
            this.changelogVisible = true;
        }
    </script>
</about-view>
