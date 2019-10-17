import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './Registration.module.scss';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import InputField from '../../components/InputField';
import SubmitButton from '../../components/SubmitButton';

const Registration = props => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.lCol}>
        <Logo className={styles.logo} alt='MusiCloud logo' />
      </div>
      <div className={styles.rCol}>
        <div className={styles.formWrapper}>
          <h1>Sign up</h1>
          <form>
            <InputField name='email' placeholder='Email' />
            <InputField name='username' placeholder='Username' />
            <InputField name='password' placeholder='Password' password={true}/>
            <InputField name='passwordRepeat' placeholder='Repeat password' password={true}/>
            <SubmitButton text='Sign up'/>
            <p>Already have an account? <Link to='/login'>Sign in!</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
};

Registration.propTypes = {

};

export default Registration;

