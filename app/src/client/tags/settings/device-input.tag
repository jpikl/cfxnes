<device-input class="device-input">
  <div>
    <label>{ opts.label }</label>
  </div>
  <div>
    <mapped-inputs input={ opts.input }></mapped-inputs>
  </div>
  <div>
    <button class="btn btn-default" onclick={ change }>Change</button>
  </div>
  <script>
    var self = this;
    var devceInput = opts.input;

    change() {
      var modal = $('#record-input-modal').modal('show');
      cfxnes.recordInput(function(sourceInput) {
        modal.modal('hide');
        if (sourceInput !== 'keyboard.escape') {
          cfxnes.unmapInputs(devceInput, sourceInput);
          cfxnes.mapInputs(devceInput, sourceInput);
          self.trigger('change');
        }
      });
    }

    this.on('update', this.tags['mapped-inputs'].update);
  </script>
</device-input>
