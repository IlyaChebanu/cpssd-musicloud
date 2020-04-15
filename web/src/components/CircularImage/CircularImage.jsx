import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Img from 'react-image';
import styles from './CircularImage.module.scss';
import CloudQuestion from '../../assets/cloud-question.jpg';
import Spinner from '../Spinner';

const CircularImage = memo(({ src, className }) => (
  <div className={`${styles.circularImage} ${className}`}>
    <Img alt="avatar" src={[src, CloudQuestion]} loader={<Spinner />} />
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
