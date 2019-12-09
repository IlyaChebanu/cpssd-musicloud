export const setToken = (token) => (dispatch) => {
  dispatch({
    type: 'SET_TOKEN',
    payload: token,
  });
};

export const deleteToken = (dispatch) => {
  dispatch({
    type: 'DELETE_TOKEN',
  });
};

export const setUsername = (username) => (dispatch) => {
  dispatch({
    type: 'SET_USERNAME',
    username,
  });
};

export const deleteUsername = (dispatch) => {
  dispatch({
    type: 'DELETE_USERNAME',
  });
};

export const setProfilePicUrl = (profilePicUrl) => (dispatch) => {
  dispatch({
    type: 'SET_PROFILE_PIC_URL',
    profilePicUrl,
  });
};

export const deleteProfilePicUrl = (dispatch) => {
  dispatch({
    type: 'DELETE_PROFILE_PIC_URL',
  });
};

export const setFollowers = (followers) => (dispatch) => {
  dispatch({
    type: 'SET_FOLLOWERS',
    followers,
  });
};

export const setFollowing = (following) => (dispatch) => {
  dispatch({
    type: 'SET_FOLLOWING',
    following,
  });
};

export const setPosts = (posts) => (dispatch) => {
  dispatch({
    type: 'SET_POSTS',
    posts,
  });
};

export const setSongs = (songs) => (dispatch) => {
  dispatch({
    type: 'SET_SONGS',
    songs,
  });
};

export const setLikes = (likes) => (dispatch) => {
  dispatch({
    type: 'SET_LIKES',
    likes,
  });
};

export const setFollowStatus = (status) => (dispatch) => {
  dispatch({
    type: 'SET_FOLLOW_STATUS',
    status,
  });
};
