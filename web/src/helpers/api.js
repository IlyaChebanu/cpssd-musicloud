import axios from 'axios';

const API_URL = `${window.location.hostname}${window.location.hostname === 'localhost' ? ':5000' : ''}/api`;

export const login = (username, password) => {
  return axios.post(`${API_URL}/v1/auth/login`, { username, password }).catch(e => e);
};

export const register = (email, username, password) => {
  return axios.post(`${API_URL}/v1/users`, { email, username, password}).catch(e => e);
}