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
);

// TODO: use extra params to make use of signed url without public access to the bucket
const makeSignedUrl = (object) => (new URL(object.url + object.fields.key)).href;

export const uploadFile = async (dir, f) => {
  let url = '';
  const res = await generatePresignedPost(dir, f.name, f.type);
  if (res.status === 200) {
    url = makeSignedUrl(res.data.signed_url);
    await putMedia(url, f, {
      headers: {
        'Content-Type': f.type,
      },
    });
  }
  return url;
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

export const getEditableSongs = () => axios.get(
  `${API_URL}/v1/audio/editable_songs?songs_per_page=100`,
  {
    headers: getAuth(),
  },
);

export const getSongState = (sid) => axios.get(
  `${API_URL}/v1/audio/state?sid=${sid}`,
  {
    headers: getAuth(),
  },
);

export const createNewSong = (title) => axios.post(
  `${API_URL}/v1/audio`,
  { title },
  {
    headers: getAuth(),
  },
);

export const patchSongName = (sid, title) => axios.patch(
  `${API_URL}/v1/audio/rename`,
  { sid, title },
  {
    headers: getAuth(),
  },
);

export const getCompiledSongs = (username) => axios.get(
  `${API_URL}/v1/audio/compiled_songs?songs_per_page=4&username=${username}`,
  {
    headers: getAuth(),
  },
);

export const getNextCompiledSongs = (next_token) => axios.get(
  `${API_URL}/v1/audio/compiled_songs?next_page=${next_token}`,
  {
    headers: getAuth(),
  },
);
