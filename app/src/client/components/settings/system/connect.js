import {connect} from 'react-redux';
import {setRegion, setSpeed} from '../../../actions';
import {selectSettingsValues} from '../../../reducers';

const mapStateToProps = state => {
  const {region, speed} = selectSettingsValues(state);
  return {region, speed};
};

const mapDispatchToProps = dispatch => ({
  onRegionChange: region => dispatch(setRegion(region)),
  onSpeedChange: speed => dispatch(setSpeed(speed)),
});

export default connect(mapStateToProps, mapDispatchToProps);
