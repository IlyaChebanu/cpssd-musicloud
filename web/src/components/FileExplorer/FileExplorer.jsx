/* eslint-disable consistent-return */
/* eslint-disable react/prop-types */
import React, {
  useState, useCallback, memo, useRef, useEffect,
} from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './FileExplorer.module.scss';
import samplesIcon from '../../assets/icons/samples.svg';
import instrumentsIcon from '../../assets/icons/instruments.svg';
import { ReactComponent as Create } from '../../assets/icons/newFolder.svg';
import {
  getRootFolderContents, createRootSampleFolder, getSynths, deleteSynth,
} from '../../helpers/api';
import FolderContents from '../FolderContents/FolderContents';
import {
  hideFileExplorer, setSamplePatchId, setSamplePatch, addSample,
} from '../../actions/studioActions';
import { showNotification } from '../../actions/notificationsActions';
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete_outline-24px.svg';
import { ReactComponent as SynthIcon } from '../../assets/icons/waveform-path-light.svg';


const FileExplorer = memo((props) => {
  const { dispatch } = props;
  const [fileList, setFileList] = useState([]);
  const [folderList, setFolderList] = useState([]);

  const [sampleTreeSelected, setSampleTreeSelected] = useState(false);
  const node = useRef();
  const getFiles = useCallback(async () => {
    const res = await getRootFolderContents();
    if (res.status === 200) {
      const files = res.data.folder.child_files;
      const folders = res.data.folder.child_folders;
      setFileList(files);
      setFolderList(folders);
      setSampleTreeSelected(true);
      return;
    }
    dispatch(showNotification({
      message: res,
    }));
  }, [dispatch]);

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

  const handleSynthClick = useCallback((synth) => (e) => {
    e.preventDefault();
    if (!props.studio.selectedSample) {
      if (!props.studio.selectedTrack) {
        return dispatch(showNotification({
          message: 'Please selecte a track first',
          type: 'info',
        }));
      }
      return dispatch(addSample(
        props.studio.selectedTrack,
        {
          name: synth.name,
          time: props.studio.currentBeat,
          fade: {
            fadeIn: 0,
            fadeOut: 0,
          },
          type: 'pattern',
          duration: 0,
          notes: [],
          patch: synth.patch,
          patchId: synth.id,
        },
      ));
    }
    dispatch(setSamplePatchId(props.studio.selectedSample, synth.id));
    dispatch(setSamplePatch(props.studio.selectedSample, synth.patch));
  }, [dispatch, props.studio.currentBeat, props.studio.selectedSample, props.studio.selectedTrack]);

  const handleDeleteSynth = useCallback((synthId) => async (e) => {
    e.preventDefault();
    await deleteSynth(synthId);
  }, []);

  const [instrumentsOpen, setInstrumentsOpen] = useState(false);
  const handleToggleInstruments = useCallback(() => {
    setInstrumentsOpen((v) => !v);
  }, []);

  return (
    <div
      ref={node}
      style={{ maxWidth: props.fileExplorerHidden ? '0%' : '30%' }}
      className={styles.explorer}
    >
      <ul>
        <li
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
              <Create
                style={{ visibility: sampleTreeSelected ? 'visible' : 'hidden' }}
                className={styles.newFolder}
                onClick={(e) => { e.stopPropagation(); createFile(); }}
              />
            )
            : null}

        </li>
        <FolderContents

          files={fileList}
          folders={folderList}
          level={1}
        />
        <li
          onClick={handleToggleInstruments}
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
              <li key={synth.id} onClick={handleSynthClick(synth)} className={styles.synth}>
                <span>
                  <SynthIcon className={styles.synthIcon} />
                  {synth.name}
                </span>
                <DeleteIcon className={styles.delete} onClick={handleDeleteSynth(synth.id)} />
              </li>
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
