/* eslint-disable no-nested-ternary */
import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './UserCard.module.scss';
import CloudQuestion from '../../assets/cloud-question.jpg';
import Spinner from '../Spinner/Spinner';
import CircularImage from '../CircularImage/CircularImage';

const UserCard = memo((props) => {
  const {
    userName, followBack, className, onClick, imageSrc, follower,
  } = props;
  return (
    <div onClick={onClick} className={`${styles.wrapper} ${className}`} role="button" tabIndex={0}>
      <Link to={`/profile?username=${userName}`}>
        <div className={styles.userWrapper}>
          <CircularImage className={styles.img} alt="song cover art" src={imageSrc || CloudQuestion} loader={<Spinner />} />
          <p className={styles.username}>{userName}</p>
          <p className={followBack ? styles.back : styles.noBack}>{(followBack) ? (follower ? 'following' : 'following you') : ''}</p>
        </div>
      </Link>
    </div>
  );
});

UserCard.propTypes = {
  follower: PropTypes.bool.isRequired,
  className: PropTypes.string,
  followBack: PropTypes.number,
  userName: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  imageSrc: PropTypes.string,
};

UserCard.defaultProps = {
  className: '',
  followBack: 0,
  userName: '',
  imageSrc: '',
};

UserCard.displayName = 'UserCard';

export default UserCard;
