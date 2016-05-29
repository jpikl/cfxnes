<input-select class="form-group">
  <label for={ opts.name } class="control-label">{ opts.label }</label>
  <div>
    <select id="{ opts.name }" class="form-control" onchange={ onChange }>
      <option each="{ opts.options }" value={ value } selected={ selected }>{ label }</option>
    </select>
  </div>
  <script type="babel">
    this.value = opts.value;

    this.onChange = event => {
      this.value = event.target.value;
      this.trigger('change', this.value);
    };

    this.setValue = value => {
      this.update({value});
    };

    this.on('update', () => {
      opts.options.forEach(option => {
        option.selected = option.value === this.value;
      });
    });
  </script>
</input-select>
