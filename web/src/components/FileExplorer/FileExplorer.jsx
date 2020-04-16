/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable consistent-return */
/* eslint-disable react/prop-types */
import React, {
  useState, useCallback, memo, useRef, useEffect,
} from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useDragEvents } from 'beautiful-react-hooks';
import ReactTooltip from 'react-tooltip';
import styles from './FileExplorer.module.scss';
import samplesIcon from '../../assets/icons/samples.svg';
import instrumentsIcon from '../../assets/icons/instruments.svg';
import { ReactComponent as Create } from '../../assets/icons/newFolder.svg';
import { ReactComponent as Add } from '../../assets/icons/add-24px.svg';
import {
  getRootFolderContents, createRootSampleFolder, getSynths, moveFile, moveFolder,
  uploadFile, saveFile,
} from '../../helpers/api';
import FolderContents from '../FolderContents/FolderContents';
import {
  hideFileExplorer, setFileMoved, setFolderMoved,
} from '../../actions/studioActions';
import { showNotification } from '../../actions/notificationsActions';
import FileExplorerSynth from '../FileExplorerSynth/FileExplorerSynth';

const FileExplorer = memo((props) => {
  const { dispatch } = props;
  const [fileList, setFileList] = useState([]);
  const [folderList, setFolderList] = useState([]);
  const [rootFolderId, setRootFolderId] = useState(0);
  const [sampleTreeSelected, setSampleTreeSelected] = useState(false);
  const node = useRef();

  const dropRef = useRef();
  const { onDrop, onDragOver } = useDragEvents(dropRef, false);

  const moveFileToFolder = useCallback(async (fileId, folderId) => {
    const res = await moveFile(fileId, folderId);
    if (res.status === 200) {
      return true;
    }
  }, []);

  const moveFolderToFolder = useCallback(async (folderId, parentFolderId) => {
    const res = await moveFolder(folderId, parentFolderId);
    if (res.status === 200) {
      return true;
    }
  }, []);

  const getFiles = useCallback(async () => {
    const res = await getRootFolderContents();
    if (res.status === 200) {
      const files = res.data.folder.child_files;
      const folders = res.data.folder.child_folders;
      setFileList(files);
      setFolderList(folders);
      setSampleTreeSelected(true);
      setRootFolderId(res.data.folder.folder_id);
      return;
    }
    dispatch(showNotification({
      message: res,
    }));
  }, [dispatch, setFileList, setFolderList]);

  onDragOver((event) => {
    event.preventDefault();
  });


  onDrop(async (event) => {
    const id = parseInt(event.dataTransfer.getData('id'), 10);
    const type = event.dataTransfer.getData('type');

    if (type === 'file') {
      const moved = await moveFileToFolder(id, rootFolderId);
      if (moved) {
        await getFiles();
      }
      dispatch(setFileMoved(id));
    } else if (type === 'folder') {
      const moved = await moveFolderToFolder(id, rootFolderId);
      if (moved) {
        await getFiles();
      }
      dispatch(setFolderMoved(id));
    }
  });


  const collapseSampleTree = useCallback(() => {
    const allAudio = document.getElementsByTagName('audio');
    for (let i = 0; i < allAudio.length; i += 1) allAudio[i].pause();
    setSampleTreeSelected(false);
    setFileList([]);
    setFolderList([]);
  }, []);

  const createFile = useCallback(async () => {
    let res = await createRootSampleFolder('New Folder');
    if (res.status === 200) {
      res = await getRootFolderContents();
      if (res.status === 200) {
        const files = res.data.folder.child_files;
        const folders = res.data.folder.child_folders;
        setFileList(files);
        setFolderList(folders);
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
  }, [dispatch]);

  const handleClick = useCallback((e) => {
    try {
      if (node.current.contains(e.target)) {
        // inside click
        return;
      }
      if ((e.target.id === 'explorer')
      || (e.toElement.viewportElement.id === 'explorer')) {
        // or click on file explorer button
        collapseSampleTree();
      } else if (!props.fileExplorerHidden) {
        const allAudio = document.getElementsByTagName('audio');
        for (let i = 0; i < allAudio.length; i += 1) allAudio[i].pause();
        dispatch(hideFileExplorer());
        setFileList([]);
      }
    } catch (err) {
      // outside click
      if (!props.fileExplorerHidden) {
        const allAudio = document.getElementsByTagName('audio');
        for (let i = 0; i < allAudio.length; i += 1) allAudio[i].pause();
        dispatch(hideFileExplorer());
        setFileList([]);
      }
    }
  }, [collapseSampleTree, dispatch, props.fileExplorerHidden]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [handleClick]);

  const [synths, setSynths] = useState([]);

  useEffect(() => {
    if (!props.fileExplorerHidden) {
      getSynths().then((res) => {
        setSynths(res.data.synths);
      });
    }
  }, [props.fileExplorerHidden]);


  const handleSynthDelete = useCallback((synthId) => () => {
    setSynths((a) => a.filter((synth) => synth.id !== synthId));
  }, []);

  const [instrumentsOpen, setInstrumentsOpen] = useState(false);
  const handleToggleInstruments = useCallback(() => {
    setInstrumentsOpen((v) => !v);
  }, []);

  const handleSampleImport = useCallback(() => {
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('accept', 'audio/*');
    fileSelector.click();
    fileSelector.onchange = async () => {
      const sampleFile = fileSelector.files[0];
      const url = await uploadFile('audio', sampleFile);
      await saveFile(sampleFile.name, url);
      await getFiles();
    };
  }, [getFiles]);

  return (
    <div
      ref={node}
      style={{ maxWidth: props.fileExplorerHidden ? '0%' : '30%' }}
      className={styles.explorer}
    >
      <ul>
        <li
          ref={dropRef}
          key="Samples"
          onClick={sampleTreeSelected ? collapseSampleTree : getFiles}
          className={sampleTreeSelected ? styles.selected : ''}
        >
          {samplesIcon && (
          <img
            className={styles.icon}
            src={samplesIcon}
            alt="Samples icon"
          />
          )}
          <p>Samples</p>
          { sampleTreeSelected
            ? (
              <div className={styles.icons}>
                <Add
                  data-tip="Import sample"
                  data-for="tooltip"
                  data-place="left"
                  onMouseOver={ReactTooltip.rebuild}
                  onBlur={ReactTooltip.hide}
                  style={{ visibility: sampleTreeSelected ? 'visible' : 'hidden' }}
                  className={styles.newFolder}
                  onClick={(e) => { e.stopPropagation(); handleSampleImport(); }}
                />
                <Create
                  data-tip="New folder"
                  data-for="tooltip"
                  data-place="left"
                  onMouseOver={ReactTooltip.rebuild}
                  onBlur={ReactTooltip.hide}
                  style={{ visibility: sampleTreeSelected ? 'visible' : 'hidden' }}
                  className={styles.newFolder}
                  onClick={(e) => { e.stopPropagation(); createFile(); }}
                />
              </div>
            )
            : null}

        </li>
        <FolderContents
          getParentContents={getFiles}
          files={fileList}
          folders={folderList}
          level={1}
        />
        <li
          onClick={handleToggleInstruments}
          key="Instruments"
        >
          {instrumentsIcon && (
          <img
            className={styles.icon}
            src={instrumentsIcon}
            alt="explorer item icon"
          />
          )}
          <p>Instruments</p>
        </li>
        {instrumentsOpen && (
          <ul className={styles.instrumentsList}>
            {synths.map((synth) => (
              <FileExplorerSynth
                key={`${synth.id}_synth`}
                synth={synth}
                onDelete={handleSynthDelete(synth.id)}
              />
            ))}
          </ul>
        )}

      </ul>

    </div>
  );
});

FileExplorer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  fileExplorerHidden: PropTypes.bool.isRequired,
};

FileExplorer.displayName = 'FileExplorer';

const mapStateToProps = ({ studio }) => ({
  fileExplorerHidden: studio.fileExplorerHidden,
  studio,
});

export default withRouter(connect(mapStateToProps)(FileExplorer));
