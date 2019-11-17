import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.scss';

const Button = memo(props => {
  return <button
    className={styles.button + (props.className? ` ${props.className}` : '')}
    type='button'
    onClick={props.onClick}
  >
    {props.children}
  </button>;
});

export default Button;

