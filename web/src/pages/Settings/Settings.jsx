import React, {
  useState, useMemo, memo, useCallback,
} from 'react';
import zxcvbn from 'zxcvbn';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cookie from 'js-cookie';
import styles from './Settings.module.scss';
import Header from '../../components/Header';
import InputField from '../../components/InputField';
import SubmitButton from '../../components/SubmitButton';
import { emailRe } from '../../helpers/constants';
import { showNotification } from '../../actions/notificationsActions';
import { patchUserDetails, deleteUser } from '../../helpers/api';
import Modal from '../../components/Modal';

const Settings = memo((props) => {
  const { dispatch, history } = props;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isModalShowing, setIsModalShowing] = useState(false);
  const [errorText] = useState('');

  const passwordStrength = useMemo(() => {
    const strengths = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return <p>{strengths[zxcvbn(newPassword).score]}</p>;
  }, [newPassword]);

  const emailBorder = useMemo(() => (submitted && email && !emailRe.test(email) ? '#b90539' : 'white'), [email, submitted]);

  const passwordBorder = useMemo(() => (submitted && !password ? '#b90539' : 'white'), [password, submitted]);

  const newPasswordBorder = useMemo(() => (submitted && newPassword && (newPassword !== repeatPassword || !repeatPassword) ? '#b90539' : 'white'), [newPassword, repeatPassword, submitted]);

  const repeatPasswordBorder = useMemo(() => (submitted && newPassword && (newPassword !== repeatPassword || !repeatPassword) ? '#b90539' : 'white'), [repeatPassword, newPassword, submitted]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const reqData = {};
    if (!(password)) {
      dispatch(showNotification({ message: 'Please enter your current password' }));
    } else if (!(newPassword || email)) {
      dispatch(showNotification({ message: 'You haven\'t entered any new values' }));
    } else {
      reqData.current_password = password;
      if (newPassword && !repeatPassword) {
        dispatch(showNotification({ message: 'Please repeat your new password' }));
      } else if (newPassword !== repeatPassword) {
        dispatch(showNotification({ message: 'Passwords do not match' }));
      } else if (newPassword && repeatPassword && (newPassword === repeatPassword)) {
        reqData.password = newPassword;
      }
      if (email && !emailRe.test(email)) {
        dispatch(showNotification({ message: 'Invalid email address' }));
      } else if (email && emailRe.test(email)) {
        reqData.email = email;
      }
      const res = await patchUserDetails(reqData);
      if (res.status === 200) {
        dispatch(showNotification({ message: 'Account updated', type: 'info' }));
        history.push('/profile');
      }
    }
    setSubmitted(true);
  }, [dispatch, history, email, password, newPassword, repeatPassword]);

  const handleAccountDeletion = useCallback(async (e) => {
    e.preventDefault();
    cookie.remove('token');
    const res = await deleteUser();
    if (res.status === 200) {
      dispatch(showNotification({ message: 'Account deleted', type: 'info' }));
      history.push('/login');
    }
    setSubmitted(true);
  }, [dispatch, history]);

  const openModal = (e) => {
    e.preventDefault();
    setIsModalShowing(true);
  };

  const closeModal = (e) => {
    e.preventDefault();
    setIsModalShowing(false);
  };

  const accountDeletionModal = useMemo(() => (
    <div className={styles.modal} style={{ visibility: isModalShowing ? 'visible' : 'hidden' }}>
      { isModalShowing ? <div role="none" onClick={closeModal} className={styles.backDrop} /> : null}
      <Modal
        header="Confirm account deletion"
        className={styles.modal}
        show={isModalShowing}
        close={closeModal}
        submit={handleAccountDeletion}
      >
        Are you sure you want to delete your account?
      </Modal>
    </div>
  ), [handleAccountDeletion, isModalShowing]);

  return (
    <div className={styles.wrapper}>
      <Header selected={2} />
      <div className={styles.formWrapper}>
        <h1>User settings</h1>
        <p className={styles.settingsError}>{errorText}</p>
        <form onSubmit={handleSubmit}>
          <title className={styles.sectionTitle}>Current password</title>
          <InputField animate onChange={setPassword} name="password" placeholder="Password" borderColour={passwordBorder} password />
          <title className={styles.sectionTitle}>Change email</title>
          <InputField animate onChange={setEmail} name="email" placeholder="Email" borderColour={emailBorder} />
          <title className={styles.sectionTitle}>Change password</title>
          <InputField animate onChange={setNewPassword} name="newPassword" placeholder="New password" borderColour={newPasswordBorder} password sideContent={passwordStrength} />
          <InputField animate onChange={setRepeatPassword} name="passwordRepeat" placeholder="Repeat password" borderColour={repeatPasswordBorder} password />
          <SubmitButton className={styles.submit} text="Save changes" />
        </form>
        <form onSubmit={openModal}>
          <SubmitButton className={styles.submit} text="Delete User" />
        </form>
      </div>
      {accountDeletionModal}
    </div>
  );
});

Settings.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

Settings.displayName = 'Settings';

export default connect()(Settings);
