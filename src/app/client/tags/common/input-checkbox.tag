<input-checkbox class="checkbox">
  <label for={ opts.name }>
    <input id={ opts.name } type="checkbox" checked={ opts.value } onclick={ click }>{ opts.label }
  </label>
  <script>
    click(event) {
      this.trigger('change', event.target.checked);
    }

    setEnabled(enabled) {
      $(this.root).toggleClass('disabled', !enabled)
            .find('input')
            .prop('disabled', !enabled);
    }
  </script>
</input-checkbox>
