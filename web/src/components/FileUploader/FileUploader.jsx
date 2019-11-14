import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import 'react-dropzone-uploader/dist/styles.css';
import Dropzone from 'react-dropzone-uploader';
import { uploadFile } from '../../helpers/api';
import cookie from 'js-cookie';


const FileUploader = () => {
    // receives array of files that are being uploaded to s3 bucket when submit button is clicked
    const handleSubmit = useCallback((files, allFiles) => {
      allFiles.forEach(f => {
        uploadFile("audio", f, cookie.get("token"));
        f.remove()
      })
    }, []);
    return (
      <Dropzone
        onSubmit={handleSubmit}
        accept="audio/*"
      />
    )
  }

FileUploader.propTypes = {
  className: PropTypes.string
};

export default FileUploader;

