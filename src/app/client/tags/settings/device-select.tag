<device-select class="device-select">
    <label>Controller&nbsp;{ opts.port }</label>
    <div class="btn-group">
        <button each={ device in devices } class="btn btn-default { active: device.value == value }" value={ device.value } onclick={ change }>{ device.label }</button>
    </div>
    <script>
        this.devices = [
            {value: "none", label: "None"},
            {value: "joypad", label: "Joypad"},
            {value: "zapper", label: "Zapper"},
        ];

        change(event) {
            var value = event.target.value;
            if (value == "none") {
                value = null;
            }
            cfxnes.setInputDevice(this.opts.port, value);
            this.trigger("change", value);
        }

        this.on("update", function() {
            this.value = cfxnes.getInputDevice(this.opts.port);
        })
    </script>
</device-select>
