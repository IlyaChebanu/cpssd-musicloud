import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './NewSong.module.scss';
import ProfilePicture from '../../assets/profiler.jpg';
import CircularImage from '../CircularImage';
import CloudQuestion from '../../assets/cloud-question.jpg';
import PlusCircle from '../../assets/icons/plus-circle-light.svg';

const NewSong = memo((props) => {
  const { className, profiler } = props;
  return (

  <div className={`${styles.wrapper} ${className}`}>
    <div className={styles.thumbWrapper}>
      <img alt="song cover art" className={styles.thumbnail} src={PlusCircle} />
      <p>New Song</p>
    </div>
  </div>
  )
}
);

NewSong.propTypes = {
  className: PropTypes.string,
};

NewSong.defaultProps = {
  className: '',
};

NewSong.displayName = 'NewSong';

export default NewSong;
