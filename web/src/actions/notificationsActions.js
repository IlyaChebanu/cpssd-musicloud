import { genId } from '../helpers/utils';

export const showNotification = notification => dispatch => {
  const duration = 5000;
  const id = genId();
  dispatch({
    type: 'ADD_NOTIFICATION',
    notification: { ...notification, id, duration }
  });
};

export const removeNotification = id => dispatch => {
  dispatch({
    type: 'REMOVE_NOTIFICATION',
    id
  });
};