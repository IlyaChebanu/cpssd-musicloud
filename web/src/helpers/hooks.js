import { useEffect } from 'react';
import store from '../store';
import { getUserDetails } from './api';
import { setProfilePicUrl } from '../actions/userActions';
import { showNotification } from '../actions/notificationsActions';


// eslint-disable-next-line import/prefer-default-export
export const useUpdateUserDetails = () => {
  const { user } = store.getState();
  useEffect(() => {
    if (user.token) {
      getUserDetails(user.username).then((res) => {
        if (res.status === 200) {
          store.dispatch(setProfilePicUrl(res.data.profile_pic_url));
        } else {
          store.dispatch(showNotification({ message: 'An unknown error has occurred.' }));
        }
      });
    }
  }, [user.token, user.username]);
};
