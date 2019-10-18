import React from 'react';
import PropTypes from 'prop-types';
import styles from './Discover.module.scss';
import Header from '../../components/Header';
import MusicSearch from '../../components/MusicSearch';

const Discover = props => {
  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.contentWrapper}>
        <MusicSearch className={styles.musicSearch}/>
      </div>
    </div>
  );
};

Discover.propTypes = {

};

export default Discover;

