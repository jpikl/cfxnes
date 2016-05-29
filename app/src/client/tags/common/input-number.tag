<input-number class="form-group">
  <label for={ opts.name } class="control-label">{ opts.label }</label>
  <div>
    <input id={ opts.name } type="number" min={ opts.min } max={ opts.max } class="form-control" value={ value } onchange={ onChange }>
  </div>
  <script type="babel">
    this.value = opts.value;

    this.onChange = event => {
      const value = event.target.value;
      if ((!opts.min || value >= opts.min) && (!opts.max || value <= opts.max)) {
        this.value = value;
        this.trigger('change', value);
      }
    };

    this.setValue = value => {
      this.update({value});
    };
  </script>
</input-number>
