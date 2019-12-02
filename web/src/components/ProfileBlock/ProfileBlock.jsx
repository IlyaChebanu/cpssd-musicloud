/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { memo, useCallback} from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './ProfileBlock.module.scss';
import SubmitButton from '../SubmitButton';
import { connect } from 'react-redux';
import history from "../../history";

const ProfileBlock = memo((props) => {

  const { className } = props;

  const goToSettings = useCallback((e) => {
      e.preventDefault();
      history.push('/settings');
  }, [history]);

  return (

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
      <form onClick={goToSettings}>
        <SubmitButton className={styles.followButton} text="Settings" />
      </form>
    </div>
    <div>
      <p className={styles.username}>Napstalgic</p>
    </div>
  </div>
)});


ProfileBlock.propTypes = {
  className: PropTypes.string,
  history: PropTypes.object.isRequired,
};

ProfileBlock.defaultProps = {
  className: '',
};

ProfileBlock.displayName = 'ProfileBlock';

export default connect()(ProfileBlock);
