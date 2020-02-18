import React, { memo, useCallback } from 'react';

import Dropzone from 'react-dropzone-uploader';
import cookie from 'js-cookie';
import { uploadFile } from '../../helpers/api';


const FileUploader = memo((type) => {
  // receives array of files that are being uploaded to s3 bucket when submit button is clicked
  const handleSubmit = useCallback((files, allFiles) => {
    allFiles.forEach((f) => {
      uploadFile(type, f, cookie.get('token'));
      f.remove();
    });
  }, [type]);
  return (
    <Dropzone
      onSubmit={handleSubmit}
      accept={`${type}/*`}
    />
  );
});

FileUploader.displayName = 'FileUploader';

export default FileUploader;
