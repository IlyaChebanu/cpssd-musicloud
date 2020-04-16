import React, {
  useState, useCallback, memo, useRef, useEffect,
} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useDragEvents } from 'beautiful-react-hooks';
import {
  setSelectedFolder, setFolderMoved, setFileMoved,
} from '../../actions/studioActions';
import { shadeColor } from '../../helpers/utils';
import { ReactComponent as ClosedFolder } from '../../assets/icons/file-explorer.svg';
import { ReactComponent as OpenFolder } from '../../assets/icons/folder-24px.svg';
import { ReactComponent as Delete } from '../../assets/icons/delete_outline-24px.svg';
import { ReactComponent as Create } from '../../assets/icons/newFolder.svg';
import {
  renameFolder, getFolderContent, deleteSampleFolder, createSampleFolder, moveFile, moveFolder,
} from '../../helpers/api';
import { showNotification } from '../../actions/notificationsActions';
import styles from './Folder.module.scss';
// eslint-disable-next-line import/no-cycle
import FolderContents from '../FolderContents/FolderContents';

const Folder = memo((props) => {
  const {
    dir, level, dispatch, selectedFolder, getParentContents, folderMoved,
  } = props;
  const [deleted, setDeleted] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selected, setSelected] = useState(selectedFolder === dir);
  const [expanded, setExpanded] = useState(false);
  const [f, setFiles] = useState([]);
  const [d, setFolders] = useState([]);
  const oldName = { current: dir.name };
  const [newName, setNewName] = useState(oldName.current);
  const ref = useRef();
  const { onDragStart, onDragEnd } = useDragEvents(ref);
  const { onDrop, onDragOver } = useDragEvents(ref, false);
  onDragStart((event) => {
    event.dataTransfer.setData('id', dir.folder_id);
    event.dataTransfer.setData('type', 'folder');
  });

  useEffect(() => {
    if (folderMoved === dir.folder_id) {
      getParentContents();
    }
  }, [dir.folder_id, folderMoved, getParentContents]);

  onDragEnd(() => {
    dispatch(setFolderMoved(-1));
  });

  onDragOver((event) => {
    event.preventDefault();
  });

  const moveFileToFolder = useCallback(async (fileId, folderId) => {
    const res = await moveFile(fileId, folderId);
    if (res.status === 200) {
      return true;
    }
    return false;
  }, []);

  const moveFolderToFolder = useCallback(async (folderId, parentFolderId) => {
    const res = await moveFolder(folderId, parentFolderId);
    if (res.status === 200) {
      return true;
    }
    return false;
  }, []);

  const getFolderContents = useCallback(async () => {
    const res = await getFolderContent(dir.folder_id);
    if (res.status === 200) {
      setExpanded(true);
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

  onDrop(async (event) => {
    const id = parseInt(event.dataTransfer.getData('id'), 10);
    const type = event.dataTransfer.getData('type');
    if (type === 'folder' && dir.folder_id === id) {
      return;
    }
    if (type === 'file') {
      const moved = await moveFileToFolder(id, dir.folder_id);
      dispatch(setFileMoved(id));
      if (moved && expanded) {
        await getFolderContents();
      }
    } else if (type === 'folder') {
      const moved = await moveFolderToFolder(id, dir.folder_id);
      dispatch(setFolderMoved(id));
      if (moved && expanded) {
        await getFolderContents();
      }
    }
  });

  const handleFolderNameChange = useCallback(async (e) => {
    e.preventDefault();
    let name = e.target.value;
    setNewName(name);
    if (!name) {
      name = 'Unnamed Folder';
    }
    await renameFolder(dir.folder_id, name);
  }, [dir.folder_id]);

  const collapse = useCallback(() => {
    setExpanded(false);
    setFiles([]);
    setFolders([]);
  }, []);

  const folderClick = useCallback((e) => {
    e.preventDefault();
    if (expanded) {
      collapse();
    } else {
      getFolderContents();
    }
  }, [collapse, expanded, getFolderContents]);


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
        const files = res.data.folder.child_files;
        const folders = res.data.folder.child_folders;
        setFiles([]);
        setFiles(files);
        setFolders([]);
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
            ref={ref}
            onMouseEnter={() => { dispatch(setSelectedFolder(dir)); }}
            onMouseLeave={() => { dispatch(setSelectedFolder('')); }}
            type="folder"
            // eslint-disable-next-line no-nested-ternary
            className={selected ? styles.selected : (expanded ? styles.expanded : '')}
            style={{ transition: 'width 200ms', backgroundColor: shadeColor('#414448', +20 * level) }}
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
            getParentContents={getFolderContents}
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
  selectedFolder: PropTypes.any.isRequired,
  dir: PropTypes.object.isRequired,
  level: PropTypes.number.isRequired,
  getParentContents: PropTypes.func.isRequired,
  folderMoved: PropTypes.number.isRequired,
};


const mapStateToProps = ({ studio }) => ({
  selectedFolder: studio.selectedFolder,
  folderMoved: studio.folderMoved,
});

export default withRouter(connect(mapStateToProps)(Folder));
