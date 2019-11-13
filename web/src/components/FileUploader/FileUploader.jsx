import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import 'react-dropzone-uploader/dist/styles.css';
import Dropzone from 'react-dropzone-uploader';
import { uploadFile } from '../../helpers/api';
import cookie from 'js-cookie';


const FileUploader = () => {
    // specify upload params and url for your files
    const getUploadParams = ({ meta }) => { return { url: 'https://httpbin.org/post' } }
    
    // called every time a file's `status` changes
    const handleChangeStatus = ({ meta, file }, status) => { console.log(status, meta, file) }
    // receives array of files that are done uploading when submit button is clicked
    const handleSubmit = useCallback((files, allFiles) => {
      console.log(files.map( f => f.meta))
      allFiles.forEach(f => {
        uploadFile("audio", f, cookie.get("token"));
        f.remove()
      })
    }, []);
    return (
      <Dropzone
        getUploadParams={getUploadParams}
        onChangeStatus={handleChangeStatus}
        onSubmit={handleSubmit}
        accept="audio/*"
      />
    )
  }

FileUploader.propTypes = {
  className: PropTypes.string
};

export default FileUploader;

