import React from 'react';
import PropTypes from 'prop-types';
import styles from './SongCard.module.scss';
import ProfilePicture from '../../assets/profiler.jpg';
import CircularImage from '../CircularImage';
import CloudQuestion from '../../assets/cloud-question.jpg';

const SongCard = props => {
  return (
    <div className={styles.wrapper + (props.className ? ` ${props.className}` : '')}>
      <div className={styles.thumbWrapper}>
        <img alt='song cover art' className={styles.thumbnail} src={CloudQuestion}/>
      </div>
      <div className={styles.details}>
        <p className={styles.title}>A song</p>
        <span>
          <CircularImage className={styles.profilePic} src={ProfilePicture}/>
          <p className={styles.username}>Napstalgic</p>
        </span>
      </div>
    </div>
  );
};

SongCard.propTypes = {
  className: PropTypes.string
};

export default SongCard;

