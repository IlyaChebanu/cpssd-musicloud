import React, {
  useState, useMemo, useCallback, memo,
} from 'react';
import PropTypes from 'prop-types';
import zxcvbn from 'zxcvbn';
import { Link as link } from 'react-router-dom';
import styles from './Registration.module.scss';
import { ReactComponent as logo } from '../../assets/logo.svg';
import { register } from '../../helpers/api';
import InputField from '../../components/InputField';
import SubmitButton from '../../components/SubmitButton';
import { emailRe } from '../../helpers/constants';

const Logo = memo(logo);
const Link = memo(link);

const Registration = memo((props) => {
  const { history } = props;

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorText, setErrorText] = useState('');

  const passwordStrength = useMemo(() => {
    const strengths = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return <p>{strengths[zxcvbn(password).score]}</p>;
  }, [password]);

  const emailBorder = useMemo(
    () => (submitted && !emailRe.test(email) ? '#b90539' : 'white'),
    [email, submitted],
  );

  const usernameBorder = useMemo(
    () => (submitted && !username ? '#b90539' : 'white'),
    [username, submitted],
  );

  const passwordBorder = useMemo(
    () => (submitted && !password ? '#b90539' : 'white'),
    [password, submitted],
  );

  const repeatPasswordBorder = useMemo(
    () => (submitted && (password !== repeatPassword || !repeatPassword) ? '#b90539' : 'white'),
    [repeatPassword, password, submitted],
  );

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (username && emailRe.test(email) && password && repeatPassword === password) {
      const res = await register(email, username, password);
      try {
        if (res.status === 200) {
          history.push('/login');
        } else if (res.status === 409) {
          setErrorText('Username or email address already taken!');
        } else {
          setErrorText('Unknown error has occurred');
          console.error(res);
        }
      } catch (err) {
        setErrorText('Fatal error');
        console.error(err);
      }
    }

    setSubmitted(true);
  }, [email, username, password, repeatPassword, history]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.lCol}>
        <Logo className={styles.logo} alt="MusiCloud logo" />
      </div>
      <div className={styles.rCol}>
        <div className={styles.formWrapper}>
          <h1>Sign up</h1>
          <p className={styles.registrationError}>{errorText}</p>
          <form onSubmit={handleSubmit}>
            <InputField
              animate
              onChange={setEmail}
              name="email"
              placeholder="Email"
              borderColour={emailBorder}
            />
            <InputField
              animate
              onChange={setUsername}
              name="username"
              placeholder="Username"
              borderColour={usernameBorder}
            />
            <InputField
              animate
              onChange={setPassword}
              name="password"
              placeholder="Password"
              borderColour={passwordBorder}
              password
              sideContent={passwordStrength}
            />
            <InputField
              animate
              onChange={setRepeatPassword}
              name="passwordRepeat"
              placeholder="Repeat password"
              borderColour={repeatPasswordBorder}
              password
            />
            <SubmitButton text="Sign up" />
            <p>
              Already have an account?
              {' '}
              <Link to="/login">Sign in!</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
});

Registration.propTypes = {
  history: PropTypes.object.isRequired,
};

Registration.displayName = 'Registration';

export default Registration;
