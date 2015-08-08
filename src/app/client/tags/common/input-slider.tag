<input-slider class="form-group">
    <label for={ opts.name } class="control-label">{ opts.label }</label>
    <input id={ opts.name } type="text">
    <script>
        var self = this;
        var slider;

        var formatters = {
            "x": function(value) {
                return value + "x";
            },
            "%": function(value) {
                return ~~(100 * value) + "%";
            }
        };

        function toNumber(value) {
            if (typeof value === "string") {
                return parseInt(value) || parseFloat(value) || null;
            } else if (typeof value === "number") {
                return value;
            }
            return null;
        }

        setEnabled(enabled) {
            slider.slider(enabled ? "enable" : "disable");
        }

        this.on("mount", function() {
            slider = $(this.root).find("input").slider({
                min: toNumber(opts.min),
                max: toNumber(opts.max),
                step: toNumber(opts.step),
                value: toNumber(opts.value),
                formatter: formatters[opts.format]
            }).on("change", function(event) {
                self.trigger("change", event.value.newValue);
            });
        });
    </script>
</input-slider>
