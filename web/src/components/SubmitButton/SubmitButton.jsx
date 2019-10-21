import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './SubmitButton.module.scss';

const SubmitButton = memo(props => {
  return <input className={styles.submit + (props.className? ` ${props.className}` : '')} type="submit" value={props.text}/>;
});

export default SubmitButton;

