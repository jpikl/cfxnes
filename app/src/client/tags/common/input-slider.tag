<input-slider class="form-group">
  <label for={ opts.name } class="control-label">{ opts.label }</label>
  <input id={ opts.name } type="text">
  <script type="babel">
    let slider;

    const formatters = {
      'x': value => value + 'x',
      '%': value => ~~(100 * value) + '%',
    };

    function toNumber(value) {
      if (typeof value === 'string') {
        return parseInt(value) || parseFloat(value) || null;
      }
      if (typeof value === 'number') {
        return value;
      }
      return null;
    }

    this.setValue = value => {
      if (slider) {
        slider.slider('setValue', value);
      } else {
        opts.value = value;
      }
    };

    this.setEnabled = enabled => {
      if (slider) {
        slider.slider(enabled ? 'enable' : 'disable');
      } else {
        opts.enabled = enabled;
      }
    };

    this.on('mount', () => {
      slider = $(this.root).find('input').slider({
        min: toNumber(opts.min),
        max: toNumber(opts.max),
        step: toNumber(opts.step),
        value: toNumber(opts.value),
        enabled: opts.enabled,
        orientation: opts.orientation || 'horizontal',
        reversed: opts.orientation === 'vertical',
        selection: opts.orientation !== 'vertical' ? 'before' : 'after',
        formatter: formatters[opts.format],
      }).on('change', event => {
        this.trigger('change', event.value.newValue);
      });
    });
  </script>
</input-slider>
