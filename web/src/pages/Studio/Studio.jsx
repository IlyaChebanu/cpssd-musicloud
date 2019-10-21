import React from 'react';
import styles from './Studio.module.scss';
import Header from '../../components/Header';

const Studio = props => {
  return (
    <div className={styles.wrapper}>
      <Header selected={0}/>
      <div className={styles.contentWrapper}>
      </div>
    </div>
  );
};

Studio.propTypes = {

};

export default Studio;

