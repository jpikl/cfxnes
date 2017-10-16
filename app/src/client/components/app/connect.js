import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {selectSettingsValues} from '../../reducers';

const mapStateToProps = state => ({
  theme: selectSettingsValues(state).theme,
});

const withState = connect(mapStateToProps);
export default component => withRouter(withState(component));
