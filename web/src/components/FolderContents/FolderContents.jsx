import React, {
} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import File from '../File/File';
// eslint-disable-next-line import/no-cycle
import Folder from '../Folder/Folder';

const FolderContents = (folder) => {
  const { files, folders, level } = folder;
  return (
    <div>
      {folders.map((item) => (
        <Folder dir={item} level={level} />
      ))}
      {files.map((file) => (
        <File
          dir={file}
          level={level}
        />
      ))}
    </div>
  );
};


const mapStateToProps = () => ({

});

export default withRouter(connect(mapStateToProps)(FolderContents));
