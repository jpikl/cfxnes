<mapped-inputs>
  <script type="babel">
    this.on('update', () => {
      if (opts.checkPort) {
        const [port, device] = opts.input.split('.');
        if (cfxnes.getInputDevice(parseInt(port)) !== device) {
          this.root.innerHTML = '--';
          return;
        }
      }

      this.root.innerHTML = cfxnes.getMappedInputs(opts.input).map(input => {
        const [source, name] = input.split('.');

        let result = name.split('-')
            .map(word => (word.length ? word[0].toUpperCase() + word.slice(1) : word))
            .join(' ');

        if (source === 'mouse') {
          result += ' button';
        } else if (source.startsWith('gamepad')) {
          result = result.replace('Dpad', 'D-pad')
                         .replace(/ $/, '-');
        }

        return result;
      }).join(' / ') || '--';
    });
  </script>
</mapped-inputs>
