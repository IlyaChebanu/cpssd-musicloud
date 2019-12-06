import React, {
  useState, useMemo, useCallback, memo,
} from 'react';
import PropTypes from 'prop-types';
import cookie from 'js-cookie';
import { connect } from 'react-redux';
import { Link as link } from 'react-router-dom';
import jwt from 'jsonwebtoken';
import styles from './Login.module.scss';
import { login } from '../../helpers/api';
import { setToken, setUsername as setUsernameAction } from '../../actions/userActions';
import { ReactComponent as logo } from '../../assets/logo.svg';
import InputField from '../../components/InputField';
import Checkbox from '../../components/Checkbox';
import SubmitButton from '../../components/SubmitButton';

const Logo = memo(logo);
const Link = memo(link);

const Login = memo((props) => {
  const { dispatch, history } = props;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const usernameBorder = useMemo(() => (submitted && !username ? '#b90539' : 'white'), [username, submitted]);

  const passwordBorder = useMemo(() => (submitted && !password ? '#b90539' : 'white'), [password, submitted]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (username && password) {
      try {
        const res = await login(username, password);
        if (res.status === 200) {
          if (rememberMe) {
            cookie.set('token', res.data.access_token);
          }
          const decoded = jwt.decode(res.data.access_token);
          dispatch(setToken(res.data.access_token));
          dispatch(setUsernameAction(decoded.username));
          history.push('/discover');
        } else if (res.status === 401) {
          setErrorText('Invalid credentails');
        } else if (res.status === 403) {
          setErrorText(
            <>
              Email not verified.
              {' '}
              <Link to="/verify" className={styles.resend}>Resend email</Link>
            </>,
          );
        } else {
          setErrorText('Unknown error has occurred');
          console.error(res);
        }
      } catch (err) {
        setErrorText('Fatal error');
        console.error(err);
      }
    }
  }, [username, password, rememberMe, dispatch, history]);


  return (
    <div className={styles.wrapper}>
      <div className={styles.lCol}>
        <Logo className={styles.logo} alt="MusiCloud logo" />
      </div>
      <div className={styles.rCol}>
        <div className={styles.formWrapper}>
          <h1>Sign in</h1>
          <p className={styles.credentialsError}>{errorText}</p>
          <form onSubmit={handleSubmit}>
            <InputField animate onChange={setUsername} name="username" placeholder="Username" borderColour={usernameBorder} />
            <InputField animate onChange={setPassword} name="password" placeholder="Password" borderColour={passwordBorder} password />
            <span>
              <Checkbox
                className={styles.checkbox}
                onChange={setRememberMe}
                value={rememberMe}
              >
                Remember me
              </Checkbox>
              <Link to="/">Forgot password?</Link>
            </span>
            <SubmitButton text="Sign in" />
            <p>
              Don&apos;t have an account?
              {' '}
              <Link to="/registration">Sign up!</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
});

Login.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

Login.displayName = 'Login';

export default connect()(Login);
