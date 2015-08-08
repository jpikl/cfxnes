<message-panel class="alert alert-dismissible alert-{ type }" show={ message }>
    <button type="button" class="close" onclick={ hide }>
        <span>&times;</span>
    </button>
    <p>{ message }</p>
    <script>
        showInfo(message) {
            this.show("info", message);
        }

        showError(message) {
            this.show("danger", message);
        }

        show(type, message) {
            this.update({type: type, message: message});
        }

        hide() {
            this.update({message: null})
        }
    </script>
</message-panel>
