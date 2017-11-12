import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {LinkButton, Loader, Main, Message, Search} from '../common';
import {ActionState} from '../../enums';
import Rom from './Rom';
import connect from './connect';
import './Library.css';

const itemPropType = PropTypes.shape(Rom.propTypes);
const itemsPropType = PropTypes.arrayOf(itemPropType);

class Library extends PureComponent {

  static propTypes = {
    fetchState: PropTypes.oneOf(ActionState.values).isRequired,
    fetchError: PropTypes.string.isRequired,
    filter: PropTypes.string.isRequired,
    items: itemsPropType.isRequired,
    visibleItems: itemsPropType.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onItemsReload: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const {fetchState, onItemsReload} = this.props;
    if (fetchState === ActionState.NONE) {
      onItemsReload();
    }
  }

  initFilterInput = input => {
    if (input && screen.width >= 992) { // Lazy desktop detection
      input.focus();
      input.select();
    }
  }

  renderErrorMessage() {
    const {fetchError, onItemsReload} = this.props;
    return (
      <Message className="library-message" type="error">
        <p>{fetchError}</p>
        <p><LinkButton onClick={onItemsReload}>Try reload items</LinkButton></p>
      </Message>
    );
  }

  renderNoDataMessage() {
    const {onItemsReload} = this.props;
    return (
      <Message className="library-message" type="info">
        <p>The library does not contain any item.</p>
        <p><LinkButton onClick={onItemsReload}>Try reload items</LinkButton></p>
      </Message>
    );
  }

  renderFilter() {
    const {filter, onFilterChange} = this.props;
    return <Search className="library-filter" refInput={this.initFilterInput}
                   placeholder="Search games" inputLabel="Filter"
                   value={filter} onChange={onFilterChange}/>;
  }

  renderItem = item => {
    return (
      <li key={item.id} className="library-item">
        <Rom {...item}/>
      </li>
    );
  };

  renderItems() {
    const {visibleItems} = this.props;
    return (
      <ul className="library-items">
        {visibleItems.map(this.renderItem)}
      </ul>
    );
  }

  render() {
    const {fetchState, items} = this.props;
    return (
      <Main className="library" wrapContent>
        <h1>Library</h1>
        {fetchState === ActionState.STARTED && <Loader>Loading items...</Loader>}
        {fetchState === ActionState.FAILURE && this.renderErrorMessage()}
        {fetchState === ActionState.SUCCESS && items.length === 0 && this.renderNoDataMessage()}
        {fetchState === ActionState.SUCCESS && items.length > 0 && this.renderFilter()}
        {fetchState === ActionState.SUCCESS && items.length > 0 && this.renderItems()}
      </Main>
    );
  }

}

export default connect(Library);
