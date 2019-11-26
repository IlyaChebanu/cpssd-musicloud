import axios from 'axios';
import store from '../store';
import { showNotification } from '../actions/notificationsActions';
import cookie from 'js-cookie';
import { deleteToken as deleteTokenAction } from '../actions/userActions';
import history from '../history';

axios.interceptors.response.use(res => res, err => {
  const state = store.getState();
  const res = err.response;
  if ([500, 422].includes(res.status)) {
    store.dispatch(showNotification({
      message: 'An unknown error has occured. Please contact the site owners.'
    }));
    console.error(err);
  }
  if (state.user.token) {
    if (res.status === 401) {
      store.dispatch(showNotification({
        message: 'Session expired. Please log back in.'
      }));
      cookie.remove('token');
      store.dispatch(deleteTokenAction);
      history.push('/login');
    }
    if (res.status === 403) {
      store.dispatch(showNotification({
        message: 'Permission to perform action denied.'
      }));
    }
  }
  return err.response;
});

const API_URL = `http://dcumusicloud.com:5000/api`;

const getAuth = () => ({
  Authorization: 'Bearer ' + store.getState().user.token
});

export const login = (username, password) => {
  return axios.post(
    `${API_URL}/v1/auth/login`,
    { username, password }
  );
};

export const register = (email, username, password) => {
  return axios.post(
    `${API_URL}/v1/users`,
    { email, username, password },
  );
}

export const reverify = email => {
  return axios.post(
    `${API_URL}/v1/users/reverify`,
    { email }
  );
}

export const deleteToken = token => {
  return axios.post(
    `${API_URL}/v1/auth/logout`,
    { access_token: token }
  );
}

const generatePresignedPost = (dir, filename, filetype, token) => {
  return axios.post(
    `${API_URL}/v1/s3/signed-form-post`,
    {
      dir: dir,
      fileName: filename,
      fileType: filetype,
    },
    {
      headers: {Authorization: "Bearer " + token}
    }
  );
}

const putMedia = (signedUrl, file, options) => {
  return axios.put(
    signedUrl, file, options).catch( e => e.response);
}

export const uploadFile = async (dir, f, token, e) => {
  var url = '';
  try {
    const res = await generatePresignedPost(dir, f.name, f.type, token)

    var options = {
      headers: {
        'Content-Type': f.type,
      }
    }
    if (res.status === 200) {
      var data = new FormData();
      data.append("file", f.file)
        const putAudio = async e1 => {

          url = makeSignedUrl(res.data.signed_url)

          const res2 = await putMedia(url, data, options)

        }
        putAudio()
    }
  } catch (e) {

    return e.response
  }
  return url.toString()

}

// TODO: use extra params to make use of signed url without public access to the bucket
const makeSignedUrl = (object) => {
  let url = new URL(object.url + object.fields.key)
  return url.href
}

export const saveState = (songId, songState) => {
  return axios.post(
    `${API_URL}/v1/audio/state`,
    { sid: songId, song_state: songState },
    {
      headers: getAuth()
    }
  );
}

export const getUserDetails = username => {
  return axios.get(
    `${API_URL}/v1/users?username=${username}`,
    {
      headers: getAuth()
    }
  );
}