import React, { useCallback, memo } from 'react';
import cookie from 'js-cookie';
import PropTypes from 'prop-types';
import styles from './Header.module.scss';
import { deleteToken } from '../../actions/userActions';
import { deleteToken as deleteTokenAPI } from '../../helpers/api';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import { ReactComponent as SignOutIcon } from '../../assets/icons/sign-out-alt-light.svg';
import ProfilePicture from '../../assets/profiler.jpg';
import CircularImage from '../CircularImage';

const Header = memo(props => {
  const { dispatch, history } = props;
  const { token } = props.user;

  const handleSignout = useCallback(
    () => {
      cookie.remove('token');
      dispatch(deleteToken);
      deleteTokenAPI(token);
      history.push('/login');
    },
    [dispatch, history, token],
  );

  return (
    <div className={styles.header}>
      <span>
        <Logo className={styles.logo}/>
        {props.children}
      </span>
      <span>
        <nav>
          <Link to='/studio' className={props.selected === 0 ? styles.selected : ''}>Studio</Link>
          <Link to='/discover' className={props.selected === 1 ? styles.selected : ''}>Discover</Link>
          <Link to='/profile' className={props.selected === 2 ? styles.selected : ''}>Profile</Link>
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
});

Header.propTypes = {

};

const mapStateToProps = ({ user }) => ({ user });

export default withRouter(connect(mapStateToProps)(Header));

