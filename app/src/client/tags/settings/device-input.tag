<device-input class="device-input">
  <div>
    <label>{ opts.label }</label>
  </div>
  <div>
    <mapped-inputs input={ opts.input }></mapped-inputs>
  </div>
  <div>
    <button class="btn btn-default" onclick={ changeInput }>Change</button>
  </div>
  <script type="babel">
    this.changeInput = () => {
      const modal = $('#record-input-modal').modal('show');
      cfxnes.recordInput(input => {
        modal.modal('hide');
        if (input !== 'keyboard.escape') {
          cfxnes.unmapInputs(opts.input, input);
          cfxnes.mapInputs(opts.input, input);
          this.trigger('change');
        }
      });
    };

    this.on('update', this.tags['mapped-inputs'].update);
  </script>
</device-input>
