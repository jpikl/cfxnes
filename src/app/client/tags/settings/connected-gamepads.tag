<connected-gamepads>
    <p if={ message }>
        <i class="icon icon-gamepad"></i> { message }
    </p>
    <p each={ gamepads }>
        <i class="icon icon-gamepad"></i> Gamepad #{ index }: { id }
    <p>
    <script>
        if (navigator.getGamepads) {
            this.on("update", function() {
                this.gamepads = [];
                var gamepads = navigator.getGamepads();
                for (var i = 0; i < gamepads.length; i++) {
                    if (gamepads[i]) {
                        this.gamepads.push(gamepads[i]);
                    }
                }
                this.message = this.gamepads.length ? null : "No gamepads seem to be connected."
                             + " Plug in a gamepad and then press any of its buttons to activate it.";
            });

            this.on("mount", function() {
                this.refreshId = setInterval(this.update, 500);
            });

            this.on("unmount", function() {
                clearInterval(this.refreshId);
            });
        } else {
            this.message = "Your browser does not seem to support gamepads.";
        }
    </script>
</connected-gamepads>
