import {connect} from 'react-redux';
import {setLibraryFilter, fetchLibraryItems} from '../../actions';
import {selectLibrary} from '../../reducers';

function getFilteredItems({items, filter}) {
  const expression = filter.toLowerCase();
  return items.filter(item => {
    const name = (item.name || '').toLowerCase();
    return name.indexOf(expression) >= 0;
  });
}

const mapStateToProps = state => {
  const library = selectLibrary(state);
  return {
    ...library,
    visibleItems: getFilteredItems(library),
  };
};

const mapDispatchToProps = dispatch => ({
  onFilterChange: filter => dispatch(setLibraryFilter(filter)),
  onItemsReload: () => dispatch(fetchLibraryItems()),
});

export default connect(mapStateToProps, mapDispatchToProps);
