import React, { useState, useMemo, useCallback, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import cookie from 'js-cookie';
import { connect } from 'react-redux'
import styles from './Login.module.scss';
import { Link as link } from 'react-router-dom';
import { login } from '../../helpers/api';
import { setToken } from '../../actions/userActions';
import { ReactComponent as logo } from '../../assets/logo.svg';
import InputField from '../../components/InputField';
import Checkbox from '../../components/Checkbox';
import SubmitButton from '../../components/SubmitButton';

const Logo = memo(logo);
const Link = memo(link);

const Login = memo(props => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // useEffect(() => {
  //   const token = cookie.get('token');
  //   if (token) {
  //     // TODO: Verify token not expired
  //     props.history.push('/discover');
  //   }
  // }, []);

  const usernameBorder = useMemo(() => {
    return submitted && !username ? '#b90539' : 'white';
  }, [username, submitted]);

  const passwordBorder = useMemo(() => {
    return submitted && !password ? '#b90539' : 'white';
  }, [password, submitted]);

  // cookie.set('token', 'testToken');
  const handleSubmit = useCallback(async e => {
    e.preventDefault();

    if (username && password) {
      const res = await login(username, password);
      if (res.status === 200) {
        if (rememberMe) {
          cookie.set('token', res.data.access_token);
        }
        props.dispatch(setToken(res.data.access_token));
        props.history.push('/discover');
      } else if (res.status === 400) {
        setErrorText('Invalid credentails');
      } else if (res.status === 401) {
        setErrorText('Email not verified');
      } else {
        setErrorText('Unknown error has occurred');
        console.error(e);
      }
    }

    setSubmitted(true);
  }, [username, password]);


  return (
    <div className={styles.wrapper}>
      <div className={styles.lCol}>
        <Logo className={styles.logo} alt='MusiCloud logo' />
      </div>
      <div className={styles.rCol}>
        <div className={styles.formWrapper}>
          <h1>Sign in</h1>
          <p className={styles.credentialsError}>{errorText}</p>
          <form onSubmit={handleSubmit}>
            <InputField onChange={setUsername} name='username' placeholder='Username' borderColour={usernameBorder}/>
            <InputField onChange={setPassword} name='password' placeholder='Password' borderColour={passwordBorder} password={true}/>
            <span>
              <Checkbox className={styles.checkbox} onChange={setRememberMe} value={rememberMe}>Remember me</Checkbox>
              <Link to='/'>Forgot password?</Link>
            </span>
            <SubmitButton text='Sign in'/>
            <p>Don't have an account? <Link to='/registration'>Sign up!</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
});

Login.propTypes = {

};

export default connect()(Login);

