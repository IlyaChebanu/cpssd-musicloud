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

export const setUsername = username => dispatch => {
  dispatch({
    type: 'SET_USERNAME',
    username
  });
};

export const deleteUsername = dispatch => {
  dispatch({
    type: 'DELETE_USERNAME'
  });
};

export const setProfilePicUrl = profilePicUrl => dispatch => {
  dispatch({
    type: 'SET_PROFILE_PIC_URL',
    profilePicUrl
  });
};

export const deleteProfilePicUrl = dispatch => {
  dispatch({
    type: 'DELETE_PROFILE_PIC_URL'
  });
};