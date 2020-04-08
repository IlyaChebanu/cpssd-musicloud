import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styles from './Modal.module.scss';

const Modal = memo((props) => {
  const {
    children, close, show, submit,
  } = props;
  return (
    <div>
      <div
        className={styles.modalWrapper}
        style={{
          transform: show ? 'translateY(0vh)' : 'translateY(-100vh)',
          opacity: show ? '1' : '0',
        }}
      >
        <div className={styles.modalHeader}>
          <h3>{props.header}</h3>
          <span role="none" className={styles.closeModalBtn} onClick={close}>×</span>
        </div>
        <div className={styles.modalBody}>
          <p>
            {children}
          </p>
        </div>
        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnCancel} onClick={close}>CLOSE</button>
          <button type="button" className={styles.btnContinue} onClick={submit}>CONFIRM</button>
        </div>
      </div>
    </div>
  );
});

Modal.propTypes = {
  children: PropTypes.string,
  header: PropTypes.string,
  close: PropTypes.func,
  submit: PropTypes.func,
  show: PropTypes.bool,
};

Modal.defaultProps = {
  close: null,
  header: '',
  show: false,
  children: '',
  submit: null,
};

Modal.displayName = 'Modal';

const mapStateToProps = ({ props }) => ({ props });

export default withRouter(connect(mapStateToProps)(Modal));
