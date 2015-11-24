<controls-row>
  <td>{ opts.inputName }</td>
  <td>{ mappedInputName }</td>
  <script>
    this.mappedInputName = detectMappedInputName(1) || detectMappedInputName(2) || '--';

    function detectMappedInputName(port) {
        if (cfxnes.getInputDevice(port) === opts.device) {
            return cfxnes.getMappedInputName(port, opts.device, opts.input);
        }
    }
  </script>
</controls-row>
