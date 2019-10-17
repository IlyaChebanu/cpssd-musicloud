import React from 'react';
import PropTypes from 'prop-types';
import styles from './Login.module.scss';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import InputField from '../../components/InputField';
import Checkbox from '../../components/Checkbox';
import SubmitButton from '../../components/SubmitButton';

const Login = props => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.lCol}>
        <Logo className={styles.logo} alt='MusiCloud logo' />
      </div>
      <div className={styles.rCol}>
        <div className={styles.formWrapper}>
          <h1>Sign in</h1>
          <form>
            <InputField name='username' placeholder='Username' />
            <InputField name='password' placeholder='Password' password={true}/>
            <span>
              <Checkbox className={styles.checkbox}>Remember me</Checkbox>
              <a href="">Forgot password?</a>
            </span>
            <SubmitButton text='Sign in'/>
            <p>Don't have an account? <a href="">Sign up!</a></p>
          </form>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {

};

export default Login;

