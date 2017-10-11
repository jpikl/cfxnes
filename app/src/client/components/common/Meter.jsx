import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Meter.css';

const renderMark = (mark, index) => (
  <div key={index} className="meter-mark">
    {mark && <span className="meter-mark-label">{mark}</span>}
  </div>
);

const Meter = ({className, vertical, marks}) => (
  <div className={classNames('meter', className, vertical ? 'vertical' : 'horizontal')}>
    {marks.map(renderMark)}
  </div>
);

Meter.propTypes = {
  className: PropTypes.string,
  vertical: PropTypes.bool,
  marks: PropTypes.arrayOf(PropTypes.string).isRequired,
};

Meter.defaultProps = {
  className: null,
  vertical: false,
};

export default Meter;
