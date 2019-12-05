import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './OwnSongCard.module.scss';
import CloudQuestion from '../../assets/cloud-question.jpg';

const OwnSongCard = memo((props) => {
  const { className, onClick } = props;
  return (
    <div onClick={onClick} className={`${styles.wrapper} ${className}`}>
      <div className={styles.thumbWrapper}>
        <img alt="song cover art" className={styles.thumbnail} src={CloudQuestion} />
      </div>
      <div className={styles.details}>
        <p className={styles.title}>{props.songName}</p>
      </div>
    </div>
  );
});

OwnSongCard.propTypes = {
  className: PropTypes.string,
  songName: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

OwnSongCard.defaultProps = {
  className: '',
  songName: '',
};

OwnSongCard.displayName = 'OwnSongCard';

export default OwnSongCard;
