import axios from 'axios';
import qs from 'querystring';

const API_URL = `http://musicloud.bounceme.net:5000/api`;

export const login = (username, password) => {
  return axios.post(
    `${API_URL}/v1/auth/login`,
    qs.stringify({ username, password }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  ).catch(e => e.response);
};

export const register = (email, username, password) => {
  return axios.post(
    `${API_URL}/v1/users`,
    qs.stringify({ email, username, password }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  ).catch(e => e.response);
}

export const reverify = email => {
  return axios.post(
    `${API_URL}/v1/users/reverify`,
    // { email }
    qs.stringify({ email }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  ).catch(e => e.response);
}