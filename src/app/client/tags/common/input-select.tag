<input-select class="form-group">
    <label for={ opts.name } class="control-label">{ opts.label }</label>
    <div>
        <select id="{ opts.name }" class="form-control" onchange={ change }>
            <!-- Workaround for bug: https://github.com/riot/riot/issues/691 -->
            <option each="{ option in opts.options }" value={ option.value }>{ option.label }</option>
        </select>
    </div>
    <script>
        change(event) {
            this.trigger("change", event.target.value);
        }

        this.on("mount", function() {
            $(this.root).find("select").val(this.opts.value);
        });
    </script>
</input-select>
