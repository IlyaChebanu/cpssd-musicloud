import cookie from 'js-cookie';
import jwt from 'jsonwebtoken';
import history from '../history';

const token = cookie.get('token') || '';
let username = '';
if (token) {
  const decoded = jwt.decode(token);
  username = decoded.username;
  if (['/', '/login'].includes(window.location.pathname)) {
    history.push('/discover');
  }
}


export default (state = {
  usersPopupHidden: true,
  token,
  username,
  profilePicUrl: '',
}, action) => {
  switch (action.type) {
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload,
      };
    case 'DELETE_TOKEN':
      return {
        ...state,
        token: undefined,
      };
    case 'SET_USERNAME':
      return {
        ...state,
        username: action.username,
      };
    case 'DELETE_USERNAME':
      return {
        ...state,
        username: undefined,
      };
    case 'SET_PROFILE_PIC_URL':
      return {
        ...state,
        profilePicUrl: action.profilePicUrl,
      };
    case 'DELETE_PROFILE_PIC_URL':
      return {
        ...state,
        profilePicUrl: undefined,
      };
    case 'SET_FOLLOWERS':
      return {
        ...state,
        followers: action.followers,
      };
    case 'SET_FOLLOWING':
      return {
        ...state,
        following: action.following,
      };
    case 'SET_POSTS':
      return {
        ...state,
        posts: action.posts,
      };
    case 'SET_SONGS':
      return {
        ...state,
        songs: action.songs,
      };
    case 'SET_LIKES':
      return {
        ...state,
        likes: action.likes,
      };
    case 'SET_FOLLOW_STATUS':
      return {
        ...state,
        follow_status: action.status,
      };
    case 'SET_PROFILER':
      return {
        ...state,
        profiler: action.profilerURL,
      };
    case 'USERS_POPUP_SHOW':
      return {
        ...state,
        usersPopupHidden: false,
      };
    case 'USERS_POPUP_HIDE':
      return {
        ...state,
        usersPopupHidden: true,
      };
    default:
      return state;
  }
};
