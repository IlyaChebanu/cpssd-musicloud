import React, { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './SongCard.module.scss';
import ProfilePicture from '../../assets/profiler.jpg';
import CircularImage from '../CircularImage';
import CloudQuestion from '../../assets/cloud-question.jpg';
import { ReactComponent as LikeIcon } from '../../assets/icons/favorite-24px.svg';
import { unlikeSong, likeSong } from '../../helpers/api';

const SongCard = memo((props) => {
  const { className, id, isLiked } = props;

  const [songLiked, setSongLiked] = useState(isLiked);

  const handleLikeSong = useCallback(() => {
    (async () => {
      if (songLiked) {
        const res = await unlikeSong(id);
        if (res.status === 200) {
          setSongLiked(false);
        }
      } else {
        const res = await likeSong(id);
        if (res.status === 200) {
          setSongLiked(true);
        }
      }
    })();
  }, [id, songLiked]);


  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.thumbWrapper}>
        <img alt="song cover art" className={styles.thumbnail} src={CloudQuestion} />
      </div>
      <div className={styles.details}>
        <p className={styles.title}>A song</p>
        <span>
          <CircularImage className={styles.profilePic} src={ProfilePicture} />
          <p className={styles.username}>Napstalgic</p>
        </span>
        <div className={styles.likesWrapper}>
          <div className={styles.likeIconWrapper}>
            <LikeIcon className={styles.likeIcon} onClick={handleLikeSong} />
            <LikeIcon className={`${styles.likeIcon} ${styles.gradient} ${songLiked ? styles.liked : ''}`} />
          </div>
          <p className={styles.likes}>9 likes</p>
        </div>
      </div>
    </div>
  );
});

SongCard.propTypes = {
  className: PropTypes.string,
  id: PropTypes.number.isRequired,
  isLiked: PropTypes.bool,
};

SongCard.defaultProps = {
  className: '',
  isLiked: false,
};

SongCard.displayName = 'SongCard';

export default SongCard;
