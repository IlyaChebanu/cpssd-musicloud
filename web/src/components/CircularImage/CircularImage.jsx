import React from 'react';
import PropTypes from 'prop-types';
import styles from './CircularImage.module.scss';

const CircularImage = props => {
  return (
    <div className={styles.circularImage + (props.className ? ` ${props.className}` : '')}>
      <img src={props.src}/>
    </div>
  );
};

CircularImage.propTypes = {
  src: PropTypes.any,
  className: PropTypes.string,
};

export default CircularImage;

