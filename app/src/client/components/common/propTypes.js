import PropTypes from 'prop-types';

export const optionPropTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export const optionsPropType = PropTypes.arrayOf(PropTypes.shape(optionPropTypes));

export function keysValuePropType(keys, valuePropType) {
  const shape = {};
  for (const key of keys) {
    shape[key] = valuePropType;
  }
  return PropTypes.shape(shape);
}
