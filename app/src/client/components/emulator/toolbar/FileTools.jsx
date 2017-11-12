import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {ButtonGroup, FileInput} from '../../common';
import {KeyCode} from '../../../keyboard';
import {ToolButton} from '../../toolbar';

export default class FileTools extends PureComponent {

  static propTypes = {
    onFileOpen: PropTypes.func.isRequired,
  };

  setFileInput = input => {
    this.fileInput = input;
  }

  handleFileRequested = () => {
    this.fileInput.click();
  }

  handleFileChange = file => {
    if (file) {
      this.props.onFileOpen(file);
    }
  }

  render() {
    return (
      <ButtonGroup className="file-tools">
        <ToolButton icon="folder-open" label="Open ROM" labelId="open-rom-label"
                    keyCode={KeyCode.O} onClick={this.handleFileRequested}/>
        <FileInput hiddenProxy refInput={this.setFileInput} onChange={this.handleFileChange}/>
      </ButtonGroup>
    );
  }

}
