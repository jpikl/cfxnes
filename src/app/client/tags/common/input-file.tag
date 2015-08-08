<input-file type="file" onchange={ change }>
    <script>
        change(event) {
            event.target.blur();
            event.preventDefault();
            event.stopPropagation();
            var file = event.target.files[0];
            if (file) {
                this.trigger("fileopen", file);
            }
        }
    </script>
</input-file>
