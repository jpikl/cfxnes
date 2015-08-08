<input-number class="form-group">
    <label for={ opts.name } class="control-label">{ opts.label }</label>
    <div>
        <input id={ opts.name } type="number" min={ opts.min } max={ opts.max } class="form-control" value={ opts.value } onchange={ change }>
    </div>
    <script>
        change(event) {
            var value = event.target.value;
            if ((!opts.min || value >= opts.min) && (!opts.max || value <= opts.max)) {
                this.trigger("change", event.target.value);
            }
        }
    </script>
</input-number>
