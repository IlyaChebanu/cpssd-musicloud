import React from 'react';
import PropTypes from 'prop-types';
import styles from './SubmitButton.module.scss';

const SubmitButton = props => {
  return <input className={styles.submit} type="submit" value={props.text}/>
}

SubmitButton.propTypes = {
  text: PropTypes.string.isRequired
}

export default SubmitButton

