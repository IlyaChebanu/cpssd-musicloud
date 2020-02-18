/* eslint-disable jsx-a11y/accessible-emoji */
import React, { memo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styles from './PostCard.module.scss';
import CircularImage from '../CircularImage';

const PostCard = memo(({
  className, message, username, time, profileImg,
}) => (
  <div className={`${styles.wrapper} ${className}`}>
    <span className={styles.postCard}>
      <span className={styles.postHeader}>
        <CircularImage src={profileImg} className={styles.profiler} />
        <p className={styles.username}>{username}</p>
        <p className={styles.timestamp}>{`posted ${moment(time).fromNow()}`}</p>
      </span>
      <p className={styles.text}>
        {message}
      </p>
    </span>
  </div>
));

PostCard.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  profileImg: PropTypes.string,
};

PostCard.defaultProps = {
  className: '',
  profileImg: '',
};

PostCard.displayName = 'PostCard';

export default PostCard;
