import React from 'react';
import PropTypes from 'prop-types';
import styles from './Checkbox.module.scss';

const Checkbox = props => {
  return (
    <label className={styles.container + (props.className ? ` ${props.className}` : '')}>
      {props.children}
      <input type='checkbox' onClick={props.onClick}/>
      <span className={styles.checkmark}/>
    </label>
  )
}

Checkbox.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func
}

export default Checkbox

