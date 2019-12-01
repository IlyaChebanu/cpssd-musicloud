import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './OwnSongCard.module.scss';
import ProfilePicture from '../../assets/profiler.jpg';
import CircularImage from '../CircularImage/CircularImage';
import CloudQuestion from '../../assets/cloud-question.jpg';

const OwnSongCard = memo((props) => {
  const { className, profiler } = props;
  return (

  <div className={`${styles.wrapper} ${className}`}>
    <div className={styles.thumbWrapper}>
      <img alt="song cover art" className={styles.thumbnail} src={CloudQuestion} />
    </div>
    <div className={styles.details}>
      <p className={styles.title}>{props.songName}</p>
    </div>
  </div>
  )
}
);

OwnSongCard.propTypes = {
  className: PropTypes.string,
  songName: PropTypes.string,
};

OwnSongCard.defaultProps = {
  className: '',
  songName: '',
};

OwnSongCard.displayName = 'OwnSongCard';

export default OwnSongCard;
