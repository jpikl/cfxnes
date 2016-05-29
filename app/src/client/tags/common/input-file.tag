<input-file type="file" onchange={ onChange }>
  <script type="babel">
    this.onChange = event => {
      event.target.blur();
      event.preventDefault();
      event.stopPropagation();
      const file = event.target.files[0];
      if (file) {
        this.trigger('fileopen', file);
      }
    };
  </script>
</input-file>
