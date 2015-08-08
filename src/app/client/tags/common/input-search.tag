<input-search>
    <input type="search" class="form-control" placeholder={ opts.placeholder } value={ opts.value } oninput={ change }>
    <script>
        change(event) {
            this.trigger("change", event.target.value);
        }

        if (this.opts.focus) {
            this.on("mount", function() {
                $("input").focus().select();
            });
        }
    </script>
</input-search>
