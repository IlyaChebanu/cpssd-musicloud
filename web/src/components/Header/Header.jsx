import React from 'react';
import PropTypes from 'prop-types';
import styles from './Header.module.scss';
import { ReactComponent as Logo } from '../../assets/logo.svg';

const Header = props => {
  return (
    <div className={styles.header}>
      <Logo className={styles.logo}/>
      <nav>
        <button>Studio</button>
        <button className={styles.selected}>Discover</button>
        <button>Profile</button>
      </nav>
    </div>
  );
};

Header.propTypes = {

};

export default Header;

