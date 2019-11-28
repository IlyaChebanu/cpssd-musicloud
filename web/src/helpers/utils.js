import { useEffect } from 'react';
import store from '../store';
import { getUserDetails } from './api';
import { setProfilePicUrl } from '../actions/userActions';
import { showNotification } from '../actions/notificationsActions';

export const clamp = (min, max, val) => Math.max(min, Math.min(max, val));

export const lerp = (v0, v1, t) => (1 - t) * v0 + t * v1;

export const genId = () => btoa(Math.random()).substring(0,12);

export const useUpdateUserDetails = () => {
  const user = store.getState().user;
  useEffect(() => {
    if (user.token) {
      getUserDetails(user.username).then(res => {
        if (res.status === 200) {
          store.dispatch(setProfilePicUrl(res.data.profile_pic_url));
        } else {
          store.dispatch(showNotification({ message: 'An unknown error has occurred.' }));
        }
      });
    }
  }, [user.token]);
};