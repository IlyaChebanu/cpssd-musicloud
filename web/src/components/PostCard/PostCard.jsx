import React from 'react';
import PropTypes from 'prop-types';
import styles from './PostCard.module.scss';
import { ReactComponent as LikeIcon } from '../../assets/icons/favorite-24px.svg';


const PostCard = props => {


  return (
    <div className={styles.wrapper + (props.className ? ` ${props.className}` : '')}>
      <span className={styles.postCard}>
        <p className={styles.text}>
          🔥 FLUTE ESSENTIALS 🔥 Twisted, air-blown #flute loops and sounds.
          Download now: https://musicloud.bounceme.net/samples/release/15171
        </p>
        <p className={styles.timestamp}>16 minutes ago</p>
        <LikeIcon className={styles.likeIcon}/>
        <p className={styles.likes}>16</p>
      </span>
    </div>
  );
};

PostCard.propTypes = {
  className: PropTypes.string
};

export default PostCard;

