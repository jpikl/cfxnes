<mapped-inputs>
  <script>
    this.on('update', function() {
      if (opts.checkPort) {
        var parts = opts.input.split('.');
        var port = parseInt(parts[0]);
        var device = parts[1];
        if (cfxnes.getInputDevice(port) !== device) {
          this.root.innerHTML = '--';
          return;
        }
      }

      this.root.innerHTML = cfxnes.getMappedInputs(opts.input).map(function(input) {
        var parts = input.split('.');
        var source = parts[0];
        var name = parts[1];

        name = name.split('-')
            .map(function(word) { return word.length ? word[0].toUpperCase() + word.slice(1) : word })
            .join(' ');

        if (source === 'mouse') {
          name += ' button';
        } else if (source.startsWith('gamepad')) {
          name = name.replace('Dpad', 'D-pad')
            .replace(/ $/, '-');
        }

        return name;
      }).join(' / ') || '--';
    });
  </script>
</mapped-inputs>
