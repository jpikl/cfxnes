<progress-button>
  <button class="btn btn-default { disabled: state != 'ready' }" onclick={ onClick }>
    <i if={ state == 'ready' } class="icon icon-{ opts.icon }"></i>
    <i if={ state == 'progress' } class="icon icon-refresh icon-spin"></i>
    <i if={ state == 'success' } class="icon icon-check"></i>
    <i if={ state == 'error' } class="icon icon-exclamation-triangle"></i>
    { title }
  </button>
  <script type="babel">
    this.state = 'ready';
    this.title = opts.title;

    this.setReady = () => {
      this.update({state: 'ready', title: opts.title});
    };

    this.setProgress = title => {
      this.update({state: 'progress', title});
    };

    this.setSuccess = title => {
      this.update({state: 'success', title});
      setTimeout(this.setReady, 3000);
    };

    this.setError = title => {
      this.update({state: 'error', title});
      setTimeout(this.setReady, 5000);
    };

    this.onClick = () => {
      if (this.state === 'ready') {
        this.trigger('click');
      }
    };
  </script>
</progress-button>
