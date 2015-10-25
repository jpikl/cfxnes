<input-search>
  <input type="search" class="form-control" placeholder={ opts.placeholder } value={ value } oninput={ change }>
  <script>
    this.value = opts.value;

    change(event) {
      this.value = event.target.value;
      this.trigger('change', this.value);
    }

    setValue(value) {
      this.update({value: value});
    }

    if (opts.focus) {
      this.on('mount', function() {
        $(this.root).find('input').focus().select();
      });
    }
  </script>
</input-search>
