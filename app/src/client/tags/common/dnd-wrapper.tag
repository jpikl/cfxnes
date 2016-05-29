<dnd-wrapper>
  <yield/>
  <script type="babel">
    const element = $(this.root);

    element.on('dragenter', () => {
      element.addClass('drag-over');
    });

    element.on('dragleave', () => {
      element.removeClass('drag-over');
    });

    element.on('dragover', event => {
      element.addClass('drag-over');
      event.preventDefault();
      event.stopPropagation();
      event.originalEvent.dataTransfer.dropEffect = 'copy';
    });

    element.on('drop', event => {
      element.removeClass('drag-over');
      event.preventDefault();
      event.stopPropagation();
      const file = event.originalEvent.dataTransfer.files[0];
      if (file) {
        this.trigger('filedrop', file);
      }
    });
  </script>
</dnd-wrapper>
