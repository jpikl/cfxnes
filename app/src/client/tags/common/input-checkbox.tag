<input-checkbox class="checkbox {disabled: !enabled}">
  <label for={ opts.name }>
    <input id={ opts.name } type="checkbox" checked={ value } disabled={ !enabled } onclick={ onChange }>{ opts.label }
  </label>
  <script type="babel">
    this.value = opts.value;
    this.enabled = true;

    this.onChange = event => {
      this.value = event.target.checked;
      this.trigger('change', this.value);
    };

    this.setValue = value => {
      this.update({value});
    };

    this.setEnabled = enabled => {
      this.update({enabled});
    };
  </script>
</input-checkbox>
