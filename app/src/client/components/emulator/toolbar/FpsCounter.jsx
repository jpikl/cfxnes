import React, {PureComponent} from 'react';
import {nes} from '../../../common';
import './FpsCounter.css';

export default class FpsCounter extends PureComponent {

  state = {
    value: 0,
  }

  componentDidMount() {
    this.timer = setInterval(this.updateFps, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  updateFps = () => {
    this.setState({value: nes.fps});
  };

  render() {
    const value = ~~this.state.value;
    return <div className="fps-counter">{value} FPS</div>;
  }

}
