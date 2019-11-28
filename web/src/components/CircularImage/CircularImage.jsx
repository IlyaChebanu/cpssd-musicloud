import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './CircularImage.module.scss';

const CircularImage = memo(({ src, className }) => (
  <div className={`${styles.circularImage} ${className}`}>
    <img alt="avatar" src={src} />
  </div>
));

CircularImage.propTypes = {
  src: PropTypes.string.isRequired,
  className: PropTypes.string,
};

CircularImage.defaultProps = {
  className: '',
};

CircularImage.displayName = 'CircularImage';

export default CircularImage;
