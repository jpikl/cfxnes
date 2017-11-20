import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Icon.css';

const Icon = ({
  className, name, size, fixedWidth, pulse, inverse,
  spin, spaceBefore, spaceAfter, labelFor, ...attrs
}) => {
  const fullClassName = classNames(
    'fa',
    `fa-${name}`,
    size && `fa-${size}`,
    {
      'fa-fw': fixedWidth,
      'fa-inverse': inverse,
      'fa-pulse': pulse,
      'fa-spin': spin,
      'fa-space-before': spaceBefore,
      'fa-space-after': spaceAfter,
    },
    className,
  );
  if (labelFor) {
    return <label className={fullClassName} htmlFor={labelFor} aria-hidden="true" {...attrs}/>;
  }
  return <i className={fullClassName} aria-hidden="true" {...attrs}/>;
};

Icon.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['lg', '1x', '2x', '3x', '4x', '5x']),
  fixedWidth: PropTypes.bool,
  inverse: PropTypes.bool,
  pulse: PropTypes.bool,
  spin: PropTypes.bool,
  spaceBefore: PropTypes.bool,
  spaceAfter: PropTypes.bool,
  labelFor: PropTypes.string,
};

Icon.defaultProps = {
  className: null,
  size: null,
  fixedWidth: false,
  inverse: false,
  pulse: false,
  spin: false,
  spaceBefore: false,
  spaceAfter: false,
  labelFor: null,
};

export default Icon;
