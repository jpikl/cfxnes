import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {getEmulatorPath} from '../../routes';
import {cartridgeSvg} from '../../images';
import './Rom.css';

const Rom = ({id, name, thumbnail}) => (
  <Link className="rom" to={getEmulatorPath(id)}>
    <div className="rom-thumbnail">
      <img className="rom-thumbnail-img" src={thumbnail} alt="Game thumbnail"/>
    </div>
    <span className="rom-name">{name}</span>
  </Link>
);

Rom.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  thumbnail: PropTypes.string,
};

Rom.defaultProps = {
  thumbnail: cartridgeSvg,
};

export default Rom;
