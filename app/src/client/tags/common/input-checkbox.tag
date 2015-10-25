<input-checkbox class="checkbox {disabled: !enabled}">
  <label for={ opts.name }>
    <input id={ opts.name } type="checkbox" checked={ value } disabled={ !enabled } onclick={ click }>{ opts.label }
  </label>
  <script>
    this.value = opts.value;
    this.enabled = true;

    click(event) {
      this.value = event.target.checked;
      this.trigger('change', this.value);
    }

    setValue(value) {
      this.update({value: value});
    }

    setEnabled(enabled) {
      this.update({enabled: enabled});
    }
  </script>
</input-checkbox>
