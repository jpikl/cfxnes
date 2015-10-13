<input-select class="form-group">
  <label for={ opts.name } class="control-label">{ opts.label }</label>
  <div>
    <select id="{ opts.name }" class="form-control" onchange={ change }>
      <option each="{ option in opts.options }" value={ option.value } selected={ option.selected }>{ option.label }</option>
    </select>
  </div>
  <script>
    this.value = opts.value;

    change(event) {
      this.value = event.target.value;
      this.trigger('change', this.value);
    }

    setValue(value) {
      this.update({value: value});
    }

    this.on('update', function() {
      var value = this.value;
      opts.options.forEach(function(option) {
        option.selected = option.value === value;
      });
    })
  </script>
</input-select>
