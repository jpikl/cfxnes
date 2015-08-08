<dnd-wrapper>
    <yield/>
    <script>
        var self = this;
        var element = $(this.root);

        element.on("dragenter", function(event) {
            element.addClass("drag-over");
        });

        element.on("dragleave", function(event) {
            element.removeClass("drag-over");
        });

        element.on("dragover", function(event) {
            element.addClass("drag-over");
            event.preventDefault();
            event.stopPropagation();
            event.originalEvent.dataTransfer.dropEffect = "copy";
        });

        element.on("drop", function(event) {
            element.removeClass("drag-over");
            event.preventDefault();
            event.stopPropagation();
            var file = event.originalEvent.dataTransfer.files[0];
            if (file) {
                self.trigger("filedrop", file);
            }
        });
    </script>
</dnd-wrapper>
