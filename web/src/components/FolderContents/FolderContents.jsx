import React, {
} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import File from '../File/File';
// eslint-disable-next-line import/no-cycle
import Folder from '../Folder/Folder';

const FolderContents = (folder) => {
  const { files, folders } = folder;
  return (
    <div>
      {folders.map((item) => (
        <Folder dir={item} />
      ))}
      {files.map((file) => (
        <File
          dir={file}
        />
      ))}
    </div>
  );
};


const mapStateToProps = () => ({

});

export default withRouter(connect(mapStateToProps)(FolderContents));
