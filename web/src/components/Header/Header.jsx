import React, { useCallback } from 'react';
import cookie from 'js-cookie';
import PropTypes from 'prop-types';
import styles from './Header.module.scss';
import { deleteToken } from '../../actions/userActions';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import { ReactComponent as SignOutIcon } from '../../assets/icons/sign-out-alt-light.svg';
import ProfilePicture from '../../assets/profiler.jpg';
import CircularImage from '../CircularImage';

const Header = props => {
  const { dispatch, history } = props;

  const handleSignout = useCallback(
    () => {
      cookie.remove('token');
      dispatch(deleteToken);
      history.push('/login');
    },
    [dispatch, history],
  );

  return (
    <div className={styles.header}>
      <Logo className={styles.logo}/>
      <span>
        <nav>
          <button className={props.selected === 0 ? styles.selected : ''}>Studio</button>
          <button className={props.selected === 1 ? styles.selected : ''}>Discover</button>
          <button className={props.selected === 2 ? styles.selected : ''}>Profile</button>
        </nav>
        <div className={styles.pictureWrapper}>
          <CircularImage src={ProfilePicture}/>
          <div className={styles.signout} onClick={handleSignout}>
            <SignOutIcon />
          </div>
        </div>
      </span>
    </div>
  );
};

Header.propTypes = {

};

export default withRouter(connect()(Header));

