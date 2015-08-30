<controls-row>
  <td>{ opts["input-name"] }</td>
  <td>{ mappedInputName }</td>
  <script>
    this.mappedInputName = cfxnes.getMappedInputName(1, this.opts.device, this.opts.input)
                        || cfxnes.getMappedInputName(2, this.opts.device, this.opts.input)
                        || '--';
  </script>
</controls-row>
