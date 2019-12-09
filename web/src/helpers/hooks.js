import { useEffect } from 'react';
import store from '../store';
import { getUserDetails } from './api';
import {
  setProfilePicUrl, setFollowers, setFollowing, setLikes, setPosts, setSongs, setFollowStatus,
  setProfiler,
} from '../actions/userActions';
import { showNotification } from '../actions/notificationsActions';


// eslint-disable-next-line import/prefer-default-export
export const useUpdateUserDetails = () => {
  const { user } = store.getState();
  const url = new URL(window.location.href);
  const username = url.searchParams.get('username');

  const dispatchProfileData = (res) => {
    store.dispatch(setProfiler(res.data.profile_pic_url));
    store.dispatch(setFollowers(res.data.followers));
    store.dispatch(setFollowing(res.data.following));
    store.dispatch(setLikes(res.data.likes));
    store.dispatch(setPosts(res.data.posts));
    store.dispatch(setSongs(res.data.songs));
    store.dispatch(setFollowStatus(res.data.follow_status));
  };

  useEffect(() => {
    if (user.token) {
      if (!username) {
        getUserDetails(user.username).then((res) => {
          if (res.status === 200) {
            dispatchProfileData(res);
          } else {
            store.dispatch(showNotification({ message: 'An unknown error has occurred.' }));
          }
        });
      } else {
        getUserDetails(username).then((res) => {
          if (res.status === 200) {
            dispatchProfileData(res);
          } else {
            store.dispatch(showNotification({ message: 'An unknown error has occurred.' }));
          }
        });
        getUserDetails(user.username).then((res) => {
          if (res.status === 200) {
            store.dispatch(setProfilePicUrl(res.data.profile_pic_url));
          } else {
            store.dispatch(showNotification({ message: 'An unknown error has occurred.' }));
          }
        });
      }
    }
  }, [user.token, user.username, username]);
};
