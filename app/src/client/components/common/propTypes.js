import PropTypes from 'prop-types';
import fromPairs from 'lodash-es/fromPairs';

export const optionPropTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export const optionsPropType = PropTypes.arrayOf(PropTypes.shape(optionPropTypes));

export function keysValuePropType(keys, valuePropType) {
  return PropTypes.shape(fromPairs(keys.map(key => [key, valuePropType])));
}
