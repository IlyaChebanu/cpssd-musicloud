import React from 'react';
import PropTypes from 'prop-types';
import styles from './Header.module.scss';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import ProfilePicture from '../../assets/profiler.jpg';
import CircularImage from '../CircularImage';

const Header = props => {
  return (
    <div className={styles.header}>
      <Logo className={styles.logo}/>
      <span>
        <nav>
          <button>Studio</button>
          <button className={styles.selected}>Discover</button>
          <button>Profile</button>
        </nav>
        <CircularImage src={ProfilePicture}/>
      </span>
    </div>
  );
};

Header.propTypes = {

};

export default Header;

