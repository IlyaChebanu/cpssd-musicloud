import React, {
  memo, useMemo, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './UsersPopup.module.scss';
import Spinner from '../Spinner/Spinner';
import UserCard from '../UserCard/UserCard';
import { hideUsersPopup } from '../../actions/userActions';
import closeIcon from '../../assets/icons/close-24px.svg';

const UsersPopup = memo((props) => {
  const {
    dispatch, follower, usersPopupHidden, users,
  } = props;
  const [loading, setLoading] = useState(false);
  const [gotUsers, setGotUsers] = useState([]);


  useEffect(() => {
    setLoading(true);
    setGotUsers(users);
    setLoading(false);
  }, [dispatch, gotUsers, users]);

  const userCards = useMemo(() => gotUsers.map((user) => (
    <UserCard
      key={user.username}
      userName={`${user.username}`}
      followBack={user.follow_back}
      follower={follower}
      className={styles.songCard}
      onClick={() => {
        dispatch(hideUsersPopup());
      }}
      imageSrc={user.profiler}
    />
  )), [dispatch, follower, gotUsers]);


  return (
    <div style={{ visibility: usersPopupHidden ? 'hidden' : 'visible' }} className={styles.wrapper}>
      <img
        onClick={() => dispatch(hideUsersPopup())}
        style={{ fill: 'white' }}
        className={styles.closePopup}
        src={closeIcon}
        alt="Close publish view"
      />
      <div className={styles.userCards}>
        {loading ? <Spinner /> : userCards}
      </div>
    </div>
  );
});

UsersPopup.propTypes = {
  follower: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  usersPopupHidden: PropTypes.bool.isRequired,
};

UsersPopup.displayName = 'UsersPopup';

const mapStateToProps = ({ studio, user }) => ({
  usersPopupHidden: user.usersPopupHidden,
  tracks: studio.tracks,
});

export default connect(mapStateToProps)(UsersPopup);
