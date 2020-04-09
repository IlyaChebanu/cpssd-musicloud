import axios from 'axios';
import cookie from 'js-cookie';
import store from '../store';
import { showNotification } from '../actions/notificationsActions';
import { deleteToken as deleteTokenAction } from '../actions/userActions';
import history from '../history';

axios.interceptors.response.use((res) => res, (err) => {
  const res = err.response || { status: null };
  if ([500, 422].includes(res.status)) {
    store.dispatch(showNotification({
      message: 'An unknown error has occured. Please contact the site owners.',
    }));
  }
  if ((window.location.pathname !== '/login' && window.location.pathname !== '/discover') && res.status === 401) {
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
  if (res.status === 404) {
    store.dispatch(showNotification({
      message: 'Object not found.',
    }));
  }
  return res;
});

const API_URL = 'https://dcumusicloud.com:5000/api';

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

export const generatePresigned = () => axios.post(
  `${API_URL}/v1/s3/signed-form-post`,
  {
    dir: 'audio',
    fileName: ' ',
    fileType: ' ',
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
  `${API_URL}/v1/audio/editable_songs?songs_per_page=25`,
  {
    headers: getAuth(),
  },
);

export const getNextEditableSongs = (next) => axios.get(
  `${API_URL}/v1/audio/editable_songs?songs_per_page=25&next_page=${next}`,
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

export const patchSongDescription = (sid, description) => axios.patch(
  `${API_URL}/v1/audio/description`,
  { sid, description },
  {
    headers: getAuth(),
  },
);

export const getTimeline = () => axios.get(
  `${API_URL}/v1/users/timeline?items_per_page=25`,
  {
    headers: getAuth(),
  },
);

export const getNextTimeline = (next) => axios.get(
  `${API_URL}/v1/users/timeline?next_page=${next}`,
  {
    headers: getAuth(),
  },
);

export const likeSong = (sid) => axios.post(
  `${API_URL}/v1/audio/like`,
  { sid },
  {
    headers: getAuth(),
  },
);

export const unlikeSong = (sid) => axios.post(
  `${API_URL}/v1/audio/unlike`,
  { sid },
  {
    headers: getAuth(),
  },
);

export const createPost = (message) => axios.post(
  `${API_URL}/v1/users/post`,
  { message },
  {
    headers: getAuth(),
  },
);

export const getUserPosts = (username) => axios.get(
  `${API_URL}/v1/users/posts?posts_per_page=25&username=${username}`,
  {
    headers: getAuth(),
  },
);

export const getNextUserPosts = (next) => axios.get(
  `${API_URL}/v1/users/posts?posts_per_page=25&next_page=${next}`,
  {
    headers: getAuth(),
  },
);

export const setSongCompiledUrl = (reqData) => axios.patch(
  `${API_URL}/v1/audio/compiled_url`,
  reqData,
  {
    headers: getAuth(),
  },
);

export const getCompiledSongs = (username, searchText, order, sortedBy) => axios.get(
  `${API_URL}/v1/audio/search?songs_per_page=25`
  + `${searchText ? `&search_term=${searchText.trim()}` : ''}`
  + `${username !== '' ? `&username=${username}` : ''}`
  + `${sortedBy !== '' && order !== '' && order !== undefined ? `&${sortedBy}=${order}` : ''}`,
  {
    headers: getAuth(),
  },
);

export const getNextCompiledSongs = (next) => axios.get(
  `${API_URL}/v1/audio/search?songs_per_page=25&next_page=${next}`,
  {
    headers: getAuth(),
  },
);

export const publishSong = (sid) => axios.post(
  `${API_URL}/v1/audio/publish`,
  { sid },
  {
    headers: getAuth(),
  },
);

export const postFollow = (username) => axios.post(
  `${API_URL}/v1/users/follow`,
  { username },
  {
    headers: getAuth(),
  },
);

export const postUnfollow = (username) => axios.post(
  `${API_URL}/v1/users/unfollow`,
  { username },
  {
    headers: getAuth(),
  },
);

export const getFollowers = (username) => axios.get(
  `${API_URL}/v1/users/followers?username=${username}&users_per_page=10000`,
  {
    headers: getAuth(),
  },
);

export const getFollowing = (username) => axios.get(
  `${API_URL}/v1/users/following?username=${username}&users_per_page=10000`,
  {
    headers: getAuth(),
  },
);

export const addSongCoverArt = (reqData) => axios.patch(
  `${API_URL}/v1/audio/cover_art`,
  reqData,
  {
    headers: getAuth(),
  },
);

export const getSongInfo = (sid) => axios.get(
  `${API_URL}/v1/audio/song?sid=${sid}`,
  {
    headers: getAuth(),
  },
);

export const changeProfiler = (reqData) => axios.patch(
  `${API_URL}/v1/users/profiler`,
  reqData,
  {
    headers: getAuth(),
  },
);

export const saveFile = (fileName, fileUrl) => axios.post(
  `${API_URL}/v1/audio/files`,
  { file_name: fileName, file_url: fileUrl },
  {
    headers: getAuth(),
  },
);

export const getRootFolderContents = () => axios.get(
  `${API_URL}/v1/audio/folders`,
  {
    headers: getAuth(),
  },
);

export const getFolderContents = (folderId) => axios.get(
  `${API_URL}/v1/audio/folders?folder_id=${folderId}`,
  {
    headers: getAuth(),
  },
);

export const deleteSampleFile = (fileId) => axios.delete(
  `${API_URL}/v1/audio/files?file_id=${fileId}`,
  {
      headers: getAuth(),
  },
);

export const renameFile = (fileId, name) => axios.patch(
  `${API_URL}/v1/audio/files?file_id=${fileId}&name=${name}`,
  {},
  {
      headers: getAuth(),
  },
);
