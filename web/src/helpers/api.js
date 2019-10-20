import axios from 'axios';

const API_URL = `${window.location.hostname}${window.location.hostname === 'localhost' ? ':5000' : ''}/api`;

export const login = (username, password) => {
  return axios.post(`${API_URL}/auth/login`, { username, password }).catch(e => e);
};