export const setToken = token => dispatch => {
  dispatch({
    type: 'SET_TOKEN',
    payload: token
  });
};

export const deleteToken = dispatch => {
  dispatch({
    type: 'DELETE_TOKEN'
  });
};