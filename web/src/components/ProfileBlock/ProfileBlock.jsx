/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './ProfileBlock.module.scss';
import SubmitButton from '../SubmitButton';

const ProfileBlock = memo(({ className }) => (

  <div className={`${styles.wrapper} ${className}`}>
    <div className={styles.topWrapper}>
      <span className={styles.profilePicture} />
      <div className={styles.stats}>
        <div className={styles.stat}>
          <Link className={styles.num}>300</Link>
          <p className={styles.class}>followers</p>
        </div>
        <div className={styles.stat}>
          <Link className={styles.num}>234</Link>
          <p className={styles.class}>following</p>
        </div>
        <div className={styles.stat}>
          <Link className={styles.num}>16</Link>
          <p className={styles.class}>songs</p>
        </div>
        <div className={styles.stat}>
          <Link className={styles.num}>12</Link>
          <p className={styles.class}>posts</p>
        </div>
        <div className={styles.stat}>
          <Link className={styles.num}>266</Link>
          <p className={styles.class}>likes</p>
        </div>
      </div>
      <SubmitButton className={styles.followButton} text="Settings" />
    </div>

    <div>
      <p className={styles.username}>Napstalgic</p>
    </div>

  </div>
));

ProfileBlock.propTypes = {
  className: PropTypes.string,
};

ProfileBlock.defaultProps = {
  className: '',
};

ProfileBlock.displayName = 'ProfileBlock';

export default ProfileBlock;
