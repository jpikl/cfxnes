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
      inputs.record(input => {
        modal.modal('hide');
        if (input !== 'keyboard.escape') {
          inputs.map.delete(opts.input);
          inputs.map.delete(input);
          inputs.map.set(opts.input, input);
          this.trigger('change');
        }
      });
    };

    this.on('update', this.tags['mapped-inputs'].update);
  </script>
</device-input>
