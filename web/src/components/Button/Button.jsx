import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.scss';

const Button = memo(({ className, children, onClick }) => (
  <button
    className={`${styles.button} ${className}`}
    type="button"
    onClick={onClick}
  >
    {children}
  </button>
));

Button.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};

Button.defaultProps = {
  className: '',
};

export default Button;
