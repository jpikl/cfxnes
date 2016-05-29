<input-search>
  <input type="search" class="form-control" placeholder={ opts.placeholder } value={ value } oninput={ onChange }>
  <script type="babel">
    this.value = opts.value;

    this.onChange = event => {
      this.value = event.target.value;
      this.trigger('change', this.value);
    };

    this.setValue = value => {
      this.update({value});
    };

    if (opts.focus) {
      this.on('mount', () => {
        $(this.root).find('input').focus().select();
      });
    }
  </script>
</input-search>
