import React, { } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import File from '../File/File';
// eslint-disable-next-line import/no-cycle
import Folder from '../Folder/Folder';

const FolderContents = (folder) => {
  const {
    files, folders, level, getParentContents,
  } = folder;
  return (
    <div style={{ borderRadius: '5px 5px 5px 5px', marginLeft: `${20}px` }}>
      {folders.map((item) => (
        <Folder
          getParentContents={getParentContents}
          dir={item}
          level={level}
        />
      ))}
      {files.map((file) => (
        <File
          getParentContents={getParentContents}
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
