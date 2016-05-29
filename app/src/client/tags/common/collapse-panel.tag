<collapse-panel class="panel panel-default">
  <div class="panel-heading">
    <h4 class="panel-title">
      <a href="#{ opts.panelId }" data-parent="#{ parent.root.id }" data-toggle="collapse" onclick={ onClick }>
        <i class="icon icon-{ opts.icon }"></i>{ opts.label }
      </a>
    </h4>
  </div>
  <div id="{ opts.panelId }" class="panel-collapse collapse">
    <div class="panel-body">
      <yield/>
    </div>
  </div>
  <script type="babel">
    this.onClick = () => {
      this.trigger('open');
    };
  </script>
</collapse-panel>
