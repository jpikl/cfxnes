import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Tooltip.css';

const TOP = 'top';
const RIGHT = 'right';
const BOTTOM = 'bottom';
const LEFT = 'left';

function createStyle(placement, position) {
  if (position != null) {
    const property = placement === TOP || placement === BOTTOM ? LEFT : TOP;
    return {[property]: `${100 * position}%`};
  }
  return null;
}

const Tooltip = ({className, placement, position, children, ...attrs}) => (
  <span className={classNames('tooltip', className, placement)}
        style={createStyle(placement, position)} {...attrs}>
    {children}
  </span>
);

Tooltip.propTypes = {
  className: PropTypes.string,
  placement: PropTypes.oneOf([TOP, RIGHT, BOTTOM, LEFT]),
  position: PropTypes.number,
  children: PropTypes.node,
};

Tooltip.defaultProps = {
  className: null,
  placement: TOP,
  position: null,
  children: null,
};

function getContainerClassName(className, hoverTrigger, activeTrigger) {
  return classNames(
    'tooltip-container',
    className,
    {
      'hover-trigger': hoverTrigger,
      'active-trigger': activeTrigger,
    },
  );
}

Tooltip.Container = ({className, hoverTrigger, activeTrigger, children, ...attrs}) => (
  <div className={getContainerClassName(className, hoverTrigger, activeTrigger)} {...attrs}>
    {children}
  </div>
);

Tooltip.Container.propTypes = {
  className: PropTypes.string,
  hoverTrigger: PropTypes.bool,
  activeTrigger: PropTypes.bool,
  children: PropTypes.node,
};

Tooltip.Container.defaultProps = {
  className: null,
  hoverTrigger: false,
  activeTrigger: false,
  children: null,
};

export default Tooltip;
