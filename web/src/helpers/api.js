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

const generatePresignedPost = (dir, filename, filetype, token) => {
  return axios.post(
    `${API_URL}/v1/s3/signed-form-post`,
    {
      dir: dir,
      fileName: filename,
      fileType: filetype,
    },
    {
      headers: {Authorization: "Bearer " + token}
    }
  ).catch(e => e.response);
}

const putMedia = (signedUrl, file, options) => {
  return axios.put(
    signedUrl, file, options).catch( e => e.response);
}

export const uploadFile = async (dir, f, token, e) => {
  try {
    const res = await generatePresignedPost(dir, f.meta.name, f.meta.type, token)
    var options = {
      headers: {
        'Content-Type': f.meta.type,
      }
    }
    if (res.status === 200) {
      var data = new FormData();
      data.append("file", f.file)
        const putAudio = async e1 => {
          const res2 = await putMedia(makeSignedUrl(res.data.signed_url), data, options)
        }
        putAudio()
    }
  } catch (e) {
    return e.response
  }
}

// TODO: use extra params to make use of signed url without public access to the bucket
const makeSignedUrl = (object) => {
  let url = new URL(object.url + object.fields.key)
  return url.href
}
