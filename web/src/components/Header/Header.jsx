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
          <button className={props.selected === 0 ? styles.selected : ''}>Studio</button>
          <button className={props.selected === 1 ? styles.selected : ''}>Discover</button>
          <button className={props.selected === 2 ? styles.selected : ''}>Profile</button>
        </nav>
        <CircularImage src={ProfilePicture}/>
      </span>
    </div>
  );
};

Header.propTypes = {

};

export default Header;

