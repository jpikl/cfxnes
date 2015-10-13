<controls-row>
  <td>{ opts["input-name"] }</td>
  <td>{ mappedInputName }</td>
  <script>
    this.mappedInputName = cfxnes.getMappedInputName(1, opts.device, opts.input)
                        || cfxnes.getMappedInputName(2, opts.device, opts.input)
                        || '--';
  </script>
</controls-row>
