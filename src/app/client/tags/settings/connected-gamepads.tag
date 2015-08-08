<connected-gamepads>
    <p if={ message }>
        <i class="icon icon-gamepad"></i> { message }
    </p>
    <p each={ gamepads }>
        <i class="icon icon-gamepad"></i> Gamepad { index }: { id }
        <span if={ mapping == 'standard' }>
            <i class="icon icon-wrench"></i> use it as
            <a href="#" data-gamepad-index={ index } data-port="1" onclick={ mapGamepad }>controller 1</a> /
            <a href="#" data-gamepad-index={ index } data-port="2" onclick={ mapGamepad }>controller 2</a>
        </span>
        <span if={ mapping != 'standard' } title="Auto-mapping functionality is not available, because your browser could not recognise layout of the gamepad.">
            <i class="icon icon-question"></i> unrecognised layout
        </span>
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

        mapGamepad(event) {
            var target = $(event.target);
            var port = parseInt(target.attr("data-port"));
            var gamepadIndex = target.attr("data-gamepad-index");

            cfxnes.setInputDevice(port, "joypad");
            cfxnes.mapInput(port, "joypad", "a",       "gamepad", gamepadIndex + "/a");
            cfxnes.mapInput(port, "joypad", "b",       "gamepad", gamepadIndex + "/b");
            cfxnes.mapInput(port, "joypad", "start",   "gamepad", gamepadIndex + "/start");
            cfxnes.mapInput(port, "joypad", "select",  "gamepad", gamepadIndex + "/back");
            cfxnes.mapInput(port, "joypad", "up",      "gamepad", gamepadIndex + "/dpad-up");
            cfxnes.mapInput(port, "joypad", "down",    "gamepad", gamepadIndex + "/dpad-down");
            cfxnes.mapInput(port, "joypad", "left",    "gamepad", gamepadIndex + "/dpad-left");
            cfxnes.mapInput(port, "joypad", "right",   "gamepad", gamepadIndex + "/dpad-right");

            this.trigger("change");
        }
    </script>
</connected-gamepads>
