import axios from 'axios';
import cookie from 'js-cookie';
import store from '../store';
import { showNotification } from '../actions/notificationsActions';
import { deleteToken as deleteTokenAction } from '../actions/userActions';
import history from '../history';

axios.interceptors.response.use((res) => res, (err) => {
  const state = store.getState();
  const res = err.response || { status: null };
  if ([500, 422].includes(res.status)) {
    store.dispatch(showNotification({
      message: 'An unknown error has occured. Please contact the site owners.',
    }));
  }
  if (state.user.token) {
    if (res.status === 401) {
      store.dispatch(showNotification({
        message: 'Session expired. Please log back in.',
      }));
      cookie.remove('token');
      store.dispatch(deleteTokenAction);
      history.push('/login');
    }
    if (res.status === 403) {
      store.dispatch(showNotification({
        message: 'Permission to perform action denied.',
      }));
    }
  }
  return res;
});

const API_URL = 'http://dcumusicloud.com:5000/api';

const getAuth = () => ({
  Authorization: `Bearer ${store.getState().user.token}`,
});

export const login = (username, password) => axios.post(
  `${API_URL}/v1/auth/login`,
  { username, password },
);

export const register = (email, username, password) => axios.post(
  `${API_URL}/v1/users`,
  { email, username, password },
);

export const reverify = (email) => axios.post(
  `${API_URL}/v1/users/reverify`,
  { email },
);

export const deleteToken = () => axios.post(
  `${API_URL}/v1/auth/logout`,
  {},
  {
    headers: getAuth(),
  },
);

const generatePresignedPost = (dir, filename, filetype) => axios.post(
  `${API_URL}/v1/s3/signed-form-post`,
  {
    dir,
    fileName: filename,
    fileType: filetype,
  },
  {
    headers: getAuth(),
  },
);

const putMedia = (signedUrl, file, options) => axios.put(
  signedUrl, file, options,
).catch((e) => e.response);

// TODO: use extra params to make use of signed url without public access to the bucket
const makeSignedUrl = (object) => {
  const url = new URL(object.url + object.fields.key);
  return url.href;
};

export const uploadFile = async (dir, f) => {
  let url = '';
  try {
    const res = await generatePresignedPost(dir, f.name, f.type);

    const options = {
      headers: {
        'Content-Type': f.type,
      },
    };
    if (res.status === 200) {
      const data = new FormData();
      data.append('file', f.file);
      const putAudio = async () => {
        url = makeSignedUrl(res.data.signed_url);

        await putMedia(url, data, options);
      };
      putAudio();
    }
  } catch (err) {
    return err.response;
  }
  return url.toString();
};

export const saveState = (songId, songState) => axios.post(
  `${API_URL}/v1/audio/state`,
  { sid: songId, song_state: songState },
  {
    headers: getAuth(),
  },
);

export const getUserDetails = (username) => axios.get(
  `${API_URL}/v1/users?username=${username}`,
  {
    headers: getAuth(),
  },
);

export const patchUserDetails = (reqData) => axios.patch(
  `${API_URL}/v1/users`,
  reqData,
  {
    headers: getAuth(),
  },
);
