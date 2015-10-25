<progress-button>
  <button class="btn btn-default { disabled: state != 'ready' }" onclick={ click }>
    <i if={ state == 'ready' } class="icon icon-{ opts.icon }"></i>
    <i if={ state == 'progress' } class="icon icon-refresh icon-spin"></i>
    <i if={ state == 'success' } class="icon icon-check"></i>
    <i if={ state == 'error' } class="icon icon-exclamation-triangle"></i>
    { title }
  </button>
  <script>
    this.state = 'ready';
    this.title = opts.title;

    setReady() {
      this.update({state: 'ready', title: opts.title})
    }

    setProgress(title) {
      this.update({state: 'progress', title: title});
    }

    setSuccess(title) {
      this.update({state: 'success', title: title});
      setTimeout(this.setReady, 3000);
    }

    setError(title) {
      this.update({state: 'error', title: title});
      setTimeout(this.setReady, 5000);
    }

    click() {
      if (this.state === 'ready') {
        this.trigger('click');
      }
    }
  </script>
</progress-button>
