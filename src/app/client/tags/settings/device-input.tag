<device-input class="device-input">
    <div>
        <label>{ opts["input-name"] }</label>
    </div>
    <div>
        <span>{ mappedInputName }</span>
    </div>
    <div>
        <button class="btn btn-default" onclick={ change }>Change</button>
    </div>
    <script>
        var self = this;
        var targetPort = this.opts.port;
        var targetId = this.opts.device;
        var targetInput = this.opts.input;

        change() {
            var modal = $("#record-input-modal").modal("show");
            cfxnes.recordInput(function(sourceId, sourceInput) {
                modal.modal("hide");
                if (sourceId !== "keyboard" || sourceInput !== "escape") {
                    cfxnes.mapInput(targetPort, targetId, targetInput, sourceId, sourceInput);
                    self.trigger("change");
                }
            });
        }

        this.on("update", function() {
            this.mappedInputName = cfxnes.getMappedInputName(targetPort, targetId, targetInput) || "--";
        });
    </script>
</device-input>
