import React, { useState, useMemo, useCallback, memo } from 'react';
import styles from './Reverify.module.scss';
import { Link as link } from 'react-router-dom';
import { reverify } from '../../helpers/api';
import { ReactComponent as logo } from '../../assets/logo.svg';
import InputField from '../../components/InputField';
import SubmitButton from '../../components/SubmitButton';

const Logo = memo(logo);
const Link = memo(link);

const emailRe =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const Reverify = memo(() => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorText, setErrorText] = useState('');

  const emailBorder = useMemo(() => {
    return submitted && !emailRe.test(email) ? '#b90539' : 'white';
  }, [email, submitted]);

  const handleSubmit = useCallback(async e => {
    e.preventDefault();

    if (emailRe.test(email)) {
      const res = await reverify(email);
      try {
        if (![200, 400].includes(res.status)) {
          setErrorText('Unknown error has occurred');
          console.error(res);
        } else {
          setErrorText(<span style={{ color: 'white' }}>Verification email sent!</span>)
        }
      } catch (e) {
        setErrorText('Fatal error');
        console.error(e);
      }
    }

    setSubmitted(true);
  }, [email]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.lCol}>
        <Logo className={styles.logo} alt='MusiCloud logo' />
      </div>
      <div className={styles.rCol}>
        <div className={styles.formWrapper}>
          <h1>Verify email</h1>
          <p className={styles.verifyError}>{errorText}</p>
          <form onSubmit={handleSubmit}>
            <InputField onChange={setEmail} name='email' placeholder='Email' borderColor={emailBorder} />
            <SubmitButton text='Send email' />
            <p>Already verified? <Link to='/login'>Sign in!</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
});


export default Reverify;