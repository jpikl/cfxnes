import {connect} from 'react-redux';
import {switchTheme} from '../../actions';
import {selectSettingsValues} from '../../reducers';

const mapStateToProps = state => ({
  theme: selectSettingsValues(state).theme,
});

const mapDispatchToProps = dispatch => ({
  onThemeSwitch: () => dispatch(switchTheme()),
});

export default connect(mapStateToProps, mapDispatchToProps);
