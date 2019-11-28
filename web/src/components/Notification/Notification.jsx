import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './Notification.module.scss';
import { connect } from 'react-redux';
import { removeNotification } from '../../actions/notificationsActions';
import { ReactComponent as CloseIcon } from '../../assets/icons/times-light.svg';

const Notification = memo(props => {
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
    }, props.duration - 400));

    setSelfDestructTimer(setTimeout(() => {
      props.dispatch(removeNotification(props.id));
    }, props.duration));
  }, []);

  const handleClick = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => {
      props.dispatch(removeNotification(props.id));
    }, 400);
  });


  useEffect(setTimers, []);

  const positioningStyle = useMemo(() => {
    return {
      transform: `translateY(${95 * (props.index)}px)`
    }
  }, [props.index]);

  return (
    <div
      className={`${styles.wrapper} ${fadeOut ? styles.fadeOut : ''}`}
      onMouseEnter={clearTimers}
      onMouseLeave={setTimers}
      onClick={handleClick}
      style={positioningStyle}
    >
      <div className={styles.top}>
        <p>ERROR!</p>
        <CloseIcon />
      </div>
      <div className={styles.errorText}>
        {props.text}
      </div>
    </div>
  );
});

Notification.propTypes = {
  text: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired
};

export default connect()(Notification);

