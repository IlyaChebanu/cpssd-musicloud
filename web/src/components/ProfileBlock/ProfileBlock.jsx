/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './ProfileBlock.module.scss';
import SubmitButton from '../SubmitButton';
import history from '../../history';
import { connect } from "react-redux";
import CloudQuestion from '../../assets/cloud-question.jpg';

const ProfileBlock = memo((props) => {
  const { className, user } = props;
  let url = new URL(window.location.href);
  let username = url.searchParams.get("username");

  const goToSettings = useCallback((e) => {
    e.preventDefault();
    history.push('/settings');
  }, []);

  const goToFollow = useCallback((e) => {
    e.preventDefault();
    history.push('/profile?username=' + username);
  }, []);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.topWrapper}>
        <img className={styles.profilePicture} src={
          (user.profilePicUrl !== null && user.profilePicUrl !== "") ? user.profilePicUrl : CloudQuestion}
        />
        <div className={styles.stats}>
          <div className={styles.stat}>
            <Link to={"/profile?username=" + username} className={styles.num}>
              {typeof user.followers === "number" ? user.followers : "?"}
            </Link>
            <p className={styles.class}>followers</p>
          </div>
          <div className={styles.stat}>
            <Link to={"/profile?username=" + username} className={styles.num}>
              {typeof user.following === "number" ? user.following : "?"}
            </Link>
            <p className={styles.class}>following</p>
          </div>
          <div className={styles.stat}>
            <Link to={"/profile?username=" + username} className={styles.num}>
              {typeof user.songs === "number" ? user.songs : "?"}
            </Link>
            <p className={styles.class}>songs</p>
          </div>
          <div className={styles.stat}>
            <Link to={"/profile?username=" + username} className={styles.num}>
              {typeof user.posts === "number" ? user.posts : "?"}
            </Link>
            <p className={styles.class}>posts</p>
          </div>
          <div className={styles.stat}>
            <Link to={"/profile?username=" + username} className={styles.num}>
              {typeof user.likes === "number" ? user.likes : "?"}
            </Link>
            <p className={styles.class}>likes</p>
          </div>
        </div>
        <form className={username === user.username ? styles.followButton : styles.hide} onSubmit={goToSettings}>
          <SubmitButton className={username === user.username ? styles.followButton : styles.hide} text="Settings" />
        </form>
        <form className={username !== user.username ? styles.followButton : styles.hide} onSubmit={goToFollow}>
          <SubmitButton className={username !== user.username ? styles.followButton : styles.hide} text="Follow" />
        </form>
      </div>
      <div>
        <p className={styles.username}>{username}</p>
      </div>
    </div>
  );
});


ProfileBlock.propTypes = {
  className: PropTypes.string,
};

ProfileBlock.defaultProps = {
  className: '',
};

ProfileBlock.displayName = 'ProfileBlock';

const mapStateToProps = ({ user }) => ({ user });

export default connect(mapStateToProps)(ProfileBlock);
