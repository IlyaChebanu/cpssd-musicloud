import React from 'react';
import PropTypes from 'prop-types';
import styles from './Discover.module.scss';
import Header from '../../components/Header';

const Discover = props => {
  return (
    <div className={styles.wrapper}>
      <Header />
    </div>
  );
};

Discover.propTypes = {

};

export default Discover;

