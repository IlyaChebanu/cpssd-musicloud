import React, { useState, useMemo, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import zxcvbn from 'zxcvbn';
import { Link as link } from 'react-router-dom';
import styles from './Registration.module.scss';
import { ReactComponent as logo } from '../../assets/logo.svg';
import { register } from '../../helpers/api';
import InputField from '../../components/InputField';
import SubmitButton from '../../components/SubmitButton';

const Logo = memo(logo);
const Link = memo(link);

const Registration = memo(props => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorText, setErrorText] = useState('');

  const passwordStrength = useMemo(() => {
    const strengths = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return strengths[zxcvbn(password).score];
  }, [password]);

  const emailBorder = useMemo(() => {
    const emailRe =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return submitted && !emailRe.test(email) ? '#b90539' : 'white';
  }, [email, submitted]);

  const usernameBorder = useMemo(() => {
    return submitted && !username ? '#b90539' : 'white';
  }, [username, submitted]);

  const passwordBorder = useMemo(() => {
    return submitted && !password ? '#b90539' : 'white';
  }, [password, submitted]);

  const repeatPasswordBorder = useMemo(() => {
    return submitted && (password !== repeatPassword || !repeatPassword) ? '#b90539' : 'white';
  }, [repeatPassword, submitted]);

  const handleSubmit = useCallback(async e => {
    e.preventDefault();

    if (username && email && password && repeatPassword === password) {
      const res = await register(email, username, password);
      if (res.status === 200) {
        props.history.push('/login');
      } else {
        setErrorText('Unknown error has occurred');
        console.error(res);
      }
    }

    setSubmitted(true);
  }, [email, username, password, repeatPassword]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.lCol}>
        <Logo className={styles.logo} alt='MusiCloud logo' />
      </div>
      <div className={styles.rCol}>
        <div className={styles.formWrapper}>
          <h1>Sign up</h1>
          <p className={styles.registrationError}>{errorText}</p>
          <form onSubmit={handleSubmit}>
            <InputField onChange={setEmail} name='email' placeholder='Email' borderColour={emailBorder}/>
            <InputField onChange={setUsername} name='username' placeholder='Username' borderColour={usernameBorder}/>
            <InputField onChange={setPassword} name='password' placeholder='Password' borderColour={passwordBorder} password={true} sideContent={passwordStrength}/>
            <InputField onChange={setRepeatPassword} name='passwordRepeat' placeholder='Repeat password' borderColour={repeatPasswordBorder} password={true}/>
            <SubmitButton text='Sign up'/>
            <p>Already have an account? <Link to='/login'>Sign in!</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
});

Registration.propTypes = {

};

export default Registration;

