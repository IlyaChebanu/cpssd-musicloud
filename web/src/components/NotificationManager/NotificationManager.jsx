import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './NotificationManager.module.scss';
import { connect } from 'react-redux';
import Notification from '../Notification';

const NotificationManager = memo(props => {
  return (
    <div
      className={styles.wrapper}
    >
      {props.notifications.map((notification, i) => (
        <Notification
          index={i}
          key={notification.id}
          text={notification.message}
          duration={notification.duration}
          id={notification.id}
        />
      ))}
    </div>
  );
});

NotificationManager.propTypes = {

};

const mapStateToProps = ({ notifications }) => ({ notifications });

export default connect(mapStateToProps)(NotificationManager);

