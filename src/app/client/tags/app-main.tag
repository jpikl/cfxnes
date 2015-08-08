<app-main>
    <div class="main-content">
        <div id="view"></div>
    </div>
    <script>
        var view;

        app.watch("route", this, function(name) {
            view && view.unmount(true);
            view = riot.mount("#view", name + "-view")[0];
        });
    </script>
</app-main>
