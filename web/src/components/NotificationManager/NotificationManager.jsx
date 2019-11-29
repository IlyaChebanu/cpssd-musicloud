import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './NotificationManager.module.scss';
import Notification from '../Notification';

const NotificationManager = memo(({ notifications }) => (
  <div
    className={styles.wrapper}
  >
    {notifications.map((notification, i) => (
      <Notification
        index={i}
        key={notification.id}
        text={notification.message}
        duration={notification.duration}
        id={notification.id}
      />
    ))}
  </div>
));

NotificationManager.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
};

NotificationManager.displayName = 'NotificationManager';

const mapStateToProps = ({ notifications }) => ({ notifications });

export default connect(mapStateToProps)(NotificationManager);
