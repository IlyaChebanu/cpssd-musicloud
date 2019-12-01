import React, { useState, useMemo, memo } from 'react';
import zxcvbn from 'zxcvbn';
import styles from './Settings.module.scss';
import Header from '../../components/Header';
import InputField from '../../components/InputField';
import SubmitButton from '../../components/SubmitButton';
import { emailRe } from '../../helpers/constants';

const Settings = memo(props => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorText] = useState('');

  const passwordStrength = useMemo(() => {
    const strengths = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return <p>{strengths[zxcvbn(newPassword).score]}</p>;
  }, [newPassword]);

  const emailBorder = useMemo(() => {
    return submitted && !emailRe.test(email) ? '#b90539' : 'white';
  }, [email, submitted]);

  const passwordBorder = useMemo(() => {
    return submitted && !password ? '#b90539' : 'white';
  }, [password, submitted]);

  const newPasswordBorder = useMemo(() => {
    return submitted && !newPassword ? '#b90539' : 'white';
  }, [newPassword, submitted]);

  const repeatPasswordBorder = useMemo(() => {
    return submitted && (newPassword !== repeatPassword || !repeatPassword) ? '#b90539' : 'white';
  }, [repeatPassword, newPassword, submitted]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className={styles.wrapper}>      
    <Header selected={2}/>
        <div className={styles.formWrapper}>
          <h1>User settings</h1>
          <p className={styles.settingsError}>{errorText}</p>
          <form onSubmit={handleSubmit}>
          <title className={styles.sectionTitle}>Change email</title>
            <InputField animate={true} onChange={setEmail} name='email' placeholder='Email' borderColour={emailBorder}/>
            <title className={styles.sectionTitle}>Provide current password (required)</title>
            <InputField animate={true} onChange={setPassword} name='password' placeholder='Password' borderColour={passwordBorder} password={true} />
            <title className={styles.sectionTitle}>Change password</title>
            <InputField animate={true} onChange={setNewPassword} name='newPassword' placeholder='New password' borderColour={newPasswordBorder} password={true} sideContent={passwordStrength}/>
            <InputField animate={true} onChange={setRepeatPassword} name='passwordRepeat' placeholder='Repeat password' borderColour={repeatPasswordBorder} password={true}/> 
            <SubmitButton text='Save changes'/>
          </form>
        </div>
      </div>
  );
});

export default Settings;

