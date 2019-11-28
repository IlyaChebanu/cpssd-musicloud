import React, {
  memo, useState, useEffect, useCallback, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './Notification.module.scss';
import { removeNotification } from '../../actions/notificationsActions';
import { ReactComponent as CloseIcon } from '../../assets/icons/times-light.svg';

const Notification = memo((props) => {
  const {
    duration, id, index, dispatch, text,
  } = props;

  const [fadeOut, setFadeOut] = useState(false);
  const [fadeTimer, setFadeTimer] = useState();
  const [selfDestructTimer, setSelfDestructTimer] = useState();


  const clearTimers = useCallback(() => {
    clearTimeout(fadeTimer);
    clearTimeout(selfDestructTimer);
  }, [fadeTimer, selfDestructTimer]);

  const setTimers = useCallback(() => {
    setFadeTimer(setTimeout(() => {
      setFadeOut(true);
    }, duration - 400));

    setSelfDestructTimer(setTimeout(() => {
      dispatch(removeNotification(id));
    }, duration));
  }, [duration, id, dispatch]);

  const handleClick = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => {
      dispatch(removeNotification(id));
    }, 400);
  }, [dispatch, id]);


  useEffect(setTimers, []);

  const positioningStyle = useMemo(() => ({
    transform: `translateY(${95 * (index)}px)`,
  }), [index]);

  return (
    <div
      className={`${styles.wrapper} ${fadeOut ? styles.fadeOut : ''}`}
      onMouseEnter={clearTimers}
      onMouseLeave={setTimers}
      onClick={handleClick}
      style={positioningStyle}
      role="alert"
    >
      <div className={styles.top}>
        <p>ERROR!</p>
        <CloseIcon />
      </div>
      <div className={styles.errorText}>
        {text}
      </div>
    </div>
  );
});

Notification.propTypes = {
  text: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  id: PropTypes.strin.isRequired,
  index: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect()(Notification);
