import React, {
  useState, useCallback, memo,
} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  setSelectedFolder,
} from '../../actions/studioActions';
import { ReactComponent as ClosedFolder } from '../../assets/icons/file-explorer.svg';
import { ReactComponent as OpenFolder } from '../../assets/icons/folder-24px.svg';
import { ReactComponent as Delete } from '../../assets/icons/delete_outline-24px.svg';
import { ReactComponent as Create } from '../../assets/icons/newFolder.svg';
import {
  renameFolder, getFolderContent, deleteSampleFolder, createSampleFolder,
} from '../../helpers/api';
import { showNotification } from '../../actions/notificationsActions';
import styles from './Folder.module.scss';
// eslint-disable-next-line import/no-cycle
import FolderContents from '../FolderContents/FolderContents';

const Folder = memo((props) => {
  const {
    dir, level, dispatch, selectedFolder,
  } = props;
  const [deleted, setDeleted] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selected, setSelected] = useState(selectedFolder === dir);
  const [expanded, setExpanded] = useState(false);
  const [f, setFiles] = useState([]);
  const [d, setFolders] = useState([]);
  const oldName = { current: dir.name };
  const [newName, setNewName] = useState(oldName.current);

  const handleFolderNameChange = useCallback(async (e) => {
    e.preventDefault();
    let name = e.target.value;
    setNewName(name);
    if (!name) {
      name = 'Unnamed Folder';
    }
    await renameFolder(dir.folder_id, name);
  }, [dir.folder_id]);

  const getFolderContents = useCallback(async () => {
    const res = await getFolderContent(dir.folder_id);
    if (res.status === 200) {
      setExpanded(true);
      dispatch(setSelectedFolder(dir));
      const files = res.data.folder.child_files;
      const folders = res.data.folder.child_folders;
      setFiles(files);
      setFolders(folders);
    } else {
      dispatch(showNotification({
        message: 'An unknown file explorer error has occurred.',
      }));
    }
  }, [dir, dispatch]);

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


  const deleteFiles = useCallback(async () => {
    await deleteSampleFolder(dir.folder_id);
    setFiles([]);
    setFolders([]);
    setDeleted(true);
  }, [dir]);

  const createFile = useCallback(async () => {
    let res = await createSampleFolder('New Folder', dir.folder_id);
    if (res.status === 200) {
      res = await getFolderContent(dir.folder_id);
      if (res.status === 200) {
        setExpanded(true);
        dispatch(setSelectedFolder(dir));
        const files = res.data.folder.child_files;
        const folders = res.data.folder.child_folders;
        setFiles(files);
        setFolders(folders);
      } else {
        dispatch(showNotification({
          message: 'An unknown file explorer error has occurred.',
        }));
      }
    } else {
      dispatch(showNotification({
        message: 'An unknown file explorer error has occurred.',
      }));
    }
  }, [dir, dispatch]);

  const onInputBlur = async (e) => {
    oldName.current = newName;
    setNewName(e.target.value);
    e.target.blur();
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
            key={`${dir.folder_id}_folder`}
          >
            { expanded
              ? <OpenFolder style={{ width: '22px', paddingRight: '6px', fill: 'white' }} />
              : <ClosedFolder style={{ width: '22px', paddingRight: '6px', fill: 'white' }} />}
            <input
              type="text"
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  onInputBlur(e);
                }
                // Skip dot, comma, slash, backslash
                if (e.keyCode === 190 || e.keyCode === 191
                   || e.keyCode === 188 || e.keyCode === 220) {
                  e.preventDefault();
                }
              }}
              onBlur={(e) => { onInputBlur(e); }}
              disabled={!selectedFolder === dir}
              style={{ cursor: !selectedFolder === dir ? 'pointer' : '' }}
              onChange={handleFolderNameChange}
              onClick={(e) => { dispatch(setSelectedFolder(dir)); e.stopPropagation(); }}
              value={newName}
            />
            <Create
              style={{ visibility: expanded ? 'visible' : 'hidden' }}
              className={styles.deleteFolder}
              onClick={(e) => { e.stopPropagation(); createFile(); }}
            />
            <Delete
              style={{ visibility: expanded ? 'visible' : 'hidden' }}
              className={styles.deleteFolder}
              onClick={(e) => { e.stopPropagation(); deleteFiles(); }}
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
  selectedFolder: PropTypes.object.isRequired,
  dir: PropTypes.object.isRequired,
  level: PropTypes.number.isRequired,
};


const mapStateToProps = ({ studio }) => ({
  selectedFolder: studio.selectedFolder,
});

export default withRouter(connect(mapStateToProps)(Folder));
