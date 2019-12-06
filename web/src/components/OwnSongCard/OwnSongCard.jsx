import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Img from 'react-image';
import styles from './OwnSongCard.module.scss';
import CloudQuestion from '../../assets/cloud-question.jpg';
import Spinner from '../Spinner/Spinner';

const OwnSongCard = memo((props) => {
  const { className, onClick, imageSrc } = props;
  return (
    <div onClick={onClick} className={`${styles.wrapper} ${className}`} role="button" tabIndex={0}>
      <div className={styles.thumbWrapper}>
        <Img alt="song cover art" src={[imageSrc, CloudQuestion]} loader={<Spinner />} />
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
  imageSrc: PropTypes.string,
};

OwnSongCard.defaultProps = {
  className: '',
  songName: '',
  imageSrc: '',
};

OwnSongCard.displayName = 'OwnSongCard';

export default OwnSongCard;
