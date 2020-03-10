import React, {
  useState, useCallback, memo, useRef,
} from 'react';
import AWS from 'aws-sdk';
import * as s3ls from 's3-ls';
import { deleteFile } from 'react-s3';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  setSelectedFolder,
} from '../../actions/studioActions';
import { ReactComponent as ClosedFolder } from '../../assets/icons/file-explorer.svg';
import { ReactComponent as OpenFolder } from '../../assets/icons/folder-24px.svg';
import { ReactComponent as Delete } from '../../assets/icons/delete_outline-24px.svg';
import { generatePresigned } from '../../helpers/api';
import { showNotification } from '../../actions/notificationsActions';
import styles from './Folder.module.scss';
// eslint-disable-next-line import/no-cycle
import FolderContents from '../FolderContents/FolderContents';

const Folder = memo((props) => {
  const { dir, dispatch, selectedFolder } = props;
  const [deleted, setDeleted] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selected, setSelected] = useState(selectedFolder === dir);
  const [expanded, setExpanded] = useState(false);
  const [f, setFiles] = useState([]);
  const [d, setFolders] = useState([]);
  const list = dir.split('/');
  const level = list.length - 3;
  const oldName = useRef(list[list.length - 2]);
  const [newName, setNewName] = useState(oldName.current);
  //   const path = list.slice(0, list.length - 1).join('/');
  const handleFolderNameChange = useCallback((e) => {
    e.preventDefault();
    setNewName(e.target.value);
  }, []);

  const [config, setConfig] = useState({
    bucketName: 'dcumusicloudbucket',
    secretAccessKey: 'XVdgFyhjyhnqicDxxXZa9rLouFv5WQdXzXwxrP0u',
    region: 'eu-west-1',
  });

  const awsConfig = useCallback(async (directory) => {
    const res = await generatePresigned('/');
    if (res.status === 200) {
      const accessKey = res.data.signed_url.fields.AWSAccessKeyId;
      config.accessKeyId = accessKey;
      config.dirName = directory;
      setConfig(config);
    }
  }, [config]);

  const getFolderContents = useCallback(async () => {
    const res = await generatePresigned('/');
    if (res.status === 200) {
      const accessKey = res.data.signed_url.fields.AWSAccessKeyId;
      AWS.config.update({
        accessKeyId: accessKey,
        secretAccessKey: 'XVdgFyhjyhnqicDxxXZa9rLouFv5WQdXzXwxrP0u',
        region: 'eu-west-1',
      });
      setExpanded(true);
      dispatch(setSelectedFolder(dir));
      const lister = s3ls({
        bucket: 'dcumusicloudbucket',
      });

      const { files, folders } = await lister.ls(dir);
      setFiles(files);
      setFolders(folders);
    } else {
      dispatch(showNotification({
        message: 'Unknown error occured',

      }));
    }
  }, [dir, dispatch]);

  const getContents = useCallback(async (directory) => {
    const res = await generatePresigned('/');
    if (res.status === 200) {
      const accessKey = res.data.signed_url.fields.AWSAccessKeyId;
      AWS.config.update({
        accessKeyId: accessKey,
        secretAccessKey: 'XVdgFyhjyhnqicDxxXZa9rLouFv5WQdXzXwxrP0u',
        region: 'eu-west-1',
      });
      const lister = s3ls({
        bucket: 'dcumusicloudbucket',
      });

      const { files, folders } = await lister.ls(directory);
      return { files, folders };
    }
    return null;
  }, []);

  const collapse = useCallback(() => {
    setExpanded(false);
    dispatch(setSelectedFolder(''));
    setFiles([]);
    setFolders([]);
  }, [dispatch]);

  const folderClick = useCallback((e) => {
    e.preventDefault();
    if (selected) {
      dispatch(setSelectedFolder(''));
    } else if (expanded && selectedFolder !== dir) {
      dispatch(setSelectedFolder(dir));
    } else if (expanded) {
      collapse();
    } else {
      getFolderContents();
    }
  }, [collapse, dir, dispatch, expanded, getFolderContents, selected, selectedFolder]);


  const deleteFromS3 = useCallback(async (directory, files, dirs) => {
    await awsConfig(directory);

    files.forEach((file) => {
      deleteFile(file.split('/').pop(), config)
        .then(() => { setFiles([]); })
        .catch((err) => console.error(err));
    });
    dirs.forEach(async (newDirectory) => {
      await awsConfig(newDirectory);
      const res = await getContents(newDirectory);
      await deleteFromS3(newDirectory.substring(0, newDirectory.length - 1),
        res.files, res.folders);
      await deleteFromS3(newDirectory.substring(0, newDirectory.length - 1), ['.'], []);
      setFolders([]);
    });
    if (dirs.length === 0) {
      await awsConfig(directory);
      deleteFile('.', config)
        .then(() => { setFiles([]); })
        .catch((err) => console.error(err));
      setDeleted(true);
    }
  }, [awsConfig, config, getContents]);

  const onInputBlur = (e, key) => {
    if (key === 13) {
      oldName.current = newName;
      setNewName(e.target.value);

      e.target.blur();
    } else {
      setNewName(oldName.current);
    }
  };


  return (
    <div>
      {!deleted
        ? (
          <li
            // eslint-disable-next-line no-nested-ternary
            className={selectedFolder === dir ? styles.selected : (expanded ? styles.expanded : '')}
            style={{ transition: 'width 200ms', marginLeft: `${level * 25}px` }}
            onClick={folderClick}
          >
            { expanded
              ? <OpenFolder style={{ width: '22px', paddingRight: '6px', fill: 'white' }} />
              : <ClosedFolder style={{ width: '22px', paddingRight: '6px', fill: 'white' }} />}
            <input
              type="text"
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  onInputBlur(e, e.keyCode);
                }
                // Skip dot, comma, slash, backslash
                if (e.keyCode === 190 || e.keyCode === 191
                   || e.keyCode === 188 || e.keyCode === 220) {
                  e.preventDefault();
                }
              }}
              onBlur={(e) => { onInputBlur(e, -1); }}
              disabled={!selectedFolder === dir}
              style={{ cursor: !selectedFolder === dir ? 'pointer' : '' }}
              onChange={handleFolderNameChange}
              onClick={(e) => { dispatch(setSelectedFolder(dir)); e.stopPropagation(); }}
              value={newName}
            />

            <Delete
              style={{ visibility: expanded ? 'visible' : 'hidden' }}
              className={styles.deleteFolder}
              onClick={(e) => { e.stopPropagation(); deleteFromS3(`${dir.substring(0, dir.length - 1)}`, f, d); }}
            />
          </li>
        )
        : null }
      {expanded
        ? (
          <FolderContents
            files={f}
            folders={d}
            level={level + 1}
          />
        )
        : null}
    </div>
  );
});

Folder.propTypes = {

  dispatch: PropTypes.func.isRequired,
  selectedFolder: PropTypes.string.isRequired,
  dir: PropTypes.string.isRequired,

};


const mapStateToProps = ({ studio }) => ({
  fileExplorerHidden: studio.fileExplorerHidden,
  selectedFolder: studio.selectedFolder,
  studio,
});

export default withRouter(connect(mapStateToProps)(Folder));
