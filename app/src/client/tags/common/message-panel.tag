<message-panel class="alert alert-dismissible alert-{ type }" show={ message }>
  <button type="button" class="close" onclick={ hide }>
    <span>&times;</span>
  </button>
  <p>{ message }</p>
  <script type="babel">
    this.showInfo = message => {
      this.update({type: 'info', message});
    };

    this.showError = message => {
      this.update({type: 'danger', message});
    };

    this.hide = () => {
      this.update({message: null});
    };
  </script>
</message-panel>
