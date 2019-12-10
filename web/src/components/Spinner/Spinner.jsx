import React from 'react';
import PropTypes from 'prop-types';
import styles from './Spinner.module.scss';

export default function Spinner({ className }) {
  return (
    <div className={`${styles.spinner} ${className}`}>
      <div className={styles.inner}>
        <div />
      </div>
    </div>
  );
}

Spinner.propTypes = {
  className: PropTypes.string,
};

Spinner.defaultProps = {
  className: '',
};
