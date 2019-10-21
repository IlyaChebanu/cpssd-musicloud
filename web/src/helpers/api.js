import axios from 'axios';

const API_URL = `http://dcumusicloud.com:5000/api`;

export const login = (username, password) => {
  return axios.post(
    `${API_URL}/v1/auth/login`,
    { username, password }
  ).catch(e => e.response);
};

export const register = (email, username, password) => {
  return axios.post(
    `${API_URL}/v1/users`,
    { email, username, password },
  ).catch(e => e.response);
}

export const reverify = email => {
  return axios.post(
    `${API_URL}/v1/users/reverify`,
    { email }
  ).catch(e => e.response);
}

export const deleteToken = token => {
  return axios.post(
    `${API_URL}/v1/auth/logout`,
    { access_token: token }
  ).catch(e => e.response);
}