import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './SubmitButton.module.scss';

const SubmitButton = memo(({ className, text }) => (
  <input className={`${styles.submit} ${className}`} type="submit" value={text} />
));

SubmitButton.propTypes = {
  className: PropTypes.string,
  text: PropTypes.string.isRequired,
};

SubmitButton.defaultProps = {
  className: '',
};

SubmitButton.displayName = 'SubmitButton';

export default SubmitButton;
