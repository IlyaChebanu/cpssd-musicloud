/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import React, {
  useCallback, useMemo, memo, useState, useEffect,
} from 'react';
import cookie from 'js-cookie';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import toWav from 'audiobuffer-to-wav';
import styles from './Header.module.scss';
import { deleteToken } from '../../actions/userActions';
import {
  deleteToken as deleteTokenAPI, saveState, uploadFile, createNewSong, patchSongName,
} from '../../helpers/api';
import { showNotification } from '../../actions/notificationsActions';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import { ReactComponent as SignOutIcon } from '../../assets/icons/sign-out-alt-light.svg';
import CircularImage from '../CircularImage';
import Dropdown from '../Dropdown';

import newIcon from '../../assets/icons/file_dropdown/new.svg';
import openIcon from '../../assets/icons/file_dropdown/open.svg';
import publishIcon from '../../assets/icons/file_dropdown/publish.svg';
import saveIcon from '../../assets/icons/file_dropdown/save.svg';
import importIcon from '../../assets/icons/file_dropdown/import.svg';
import exportIcon from '../../assets/icons/file_dropdown/export.svg';
import generateIcon from '../../assets/icons/file_dropdown/generate.svg';
import exitIcon from '../../assets/icons/file_dropdown/exit.svg';
import { renderTracks } from '../../middleware/audioRedux';
import { forceDownload, genId } from '../../helpers/utils';
import {
  setTrackAtIndex,
  setTracks,
  hideSongPicker,
  showSongPicker,
  setTempo,
  setSongName,
  setSongId,
  stop,
  setSampleTime,
  setSelectedSample,
  setSampleLoading,
} from '../../actions/studioActions';


const Header = memo((props) => {
  const {
    selected, studio, children, dispatch, history, user,
  } = props;
  const { tempo, tracks, songId } = studio;
  const { profilePicUrl } = user;
  const [nameInput, setNameInput] = useState(studio.songName);

  const handleSaveState = useCallback(async () => {
    if (!songId) return true;
    const songState = { tempo, tracks };
    const res = await saveState(songId, songState);
    if (res.status === 200) {
      dispatch(showNotification({ message: 'Song saved', type: 'info' }));
      return true;
    }
    return false;
  }, [tempo, tracks, songId, dispatch]);


  const handleSampleImport = useCallback(() => {
    if (studio.tracks.length === 0) {
      dispatch(showNotification({ message: 'Please add a track first', type: 'info' }));
      return;
    }
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('accept', 'audio/*');
    fileSelector.click();
    let sampleState = {};
    const track = { ...studio.tracks[studio.selectedTrack] };
    fileSelector.onchange = function onChange() {
      const sampleFile = fileSelector.files[0];
      const response = uploadFile('audio', sampleFile, cookie.get('token'));
      const cast = Promise.resolve(response);
      cast.then((url) => {
        sampleState = {
          url,
          id: genId(),
          time: studio.currentBeat,
          track: studio.selectedTrack,
        };
        track.samples.push(sampleState);
        dispatch(setTrackAtIndex(track, studio.selectedTrack));
      });
    };
    dispatch(setSelectedSample(sampleState.id));
    dispatch(setSampleTime(sampleState.time, sampleState.id));
    dispatch(setSampleLoading(true));
    dispatch(setTracks(studio.tracks));
  }, [dispatch, studio]);

  const exportAction = useCallback(async () => {
    const renderedBuffer = await renderTracks(studio);
    const encoded = toWav(renderedBuffer);

    forceDownload([new DataView(encoded)], 'audio/wav', `${studio.songName}.wav`); // for mp3 [new DataView] not needed
  }, [studio]);

  const handleShowSongPicker = useCallback(async () => {
    if (await handleSaveState()) {
      dispatch(stop);
      dispatch(setTracks([]));
      dispatch(setSongId(null));
      dispatch(setSongName('New Song'));
      dispatch(setTempo(140));
      dispatch(showSongPicker());
    }
  }, [dispatch, handleSaveState]);

  const handleHideSongPicker = useCallback(async () => {
    if (await handleSaveState()) {
      const res = await createNewSong('New Song');
      if (res.status === 200) {
        dispatch(stop);
        dispatch(setTracks([]));
        dispatch(setSongId(res.data.sid));
        dispatch(setTempo(140));
        dispatch(setSongName('New Song'));
        dispatch(hideSongPicker());
      }
    }
  }, [dispatch, handleSaveState]);

  const fileDropdownItems = useMemo(() => [
    { name: 'New', action: handleHideSongPicker, icon: newIcon },
    { name: 'Open', action: handleShowSongPicker, icon: openIcon },
    { name: 'Publish', icon: publishIcon },
    { name: 'Save', icon: saveIcon, action: handleSaveState },
    { name: 'Import', icon: importIcon, action: handleSampleImport },
    { name: 'Export', icon: exportIcon, action: exportAction },
    { name: 'Generate', icon: generateIcon },
    { name: 'Exit', icon: exitIcon },
  ], [
    exportAction,
    handleHideSongPicker,
    handleSampleImport,
    handleSaveState,
    handleShowSongPicker,
  ]);

  const editDropdownItems = useMemo(() => [
    { name: 'Edit 1' },
    { name: 'Edit 2' },
    { name: 'Edit 3' },
    { name: 'Edit 4' },
    { name: 'Edit 5' },
    { name: 'Edit 6' },
    { name: 'Edit 7' },
    { name: 'Edit 8' },
  ], []);

  const handleSignout = useCallback(() => {
    cookie.remove('token');
    deleteTokenAPI();
    dispatch(deleteToken);
    history.push('/login');
  }, [dispatch, history]);

  useEffect(() => {
    if (nameInput !== studio.songName) {
      setNameInput(studio.songName);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studio.songName]);

  const handleChange = useCallback((e) => {
    setNameInput(e.target.value);
  }, []);

  const handleSetName = useCallback(async () => {
    dispatch(setSongName(nameInput));
    setNameInput(nameInput);
    const res = patchSongName(studio.songId, nameInput);
    return res.status === 200;
  }, [dispatch, nameInput, studio.songId]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSetName();
    }
  }, [handleSetName]);

  return (
    <div className={styles.header}>
      <span className={styles.left}>
        <Logo className={styles.logo} />
        <div className={(!studio.songPickerHidden || selected !== 0)
          ? styles.hide : styles.dropdownBlock}
        >
          <Dropdown items={fileDropdownItems} title="File" />
          <Dropdown items={editDropdownItems} title="Edit" />
          {children}
        </div>
      </span>
      <span className={styles.songName}>
        <input type={(!studio.songPickerHidden || selected !== 0) ? 'hidden' : 'text'} value={nameInput} onChange={handleChange} onBlur={handleSetName} onKeyDown={handleKeyDown} />
      </span>
      <span className={styles.nav}>
        <nav>
          <Link to="/studio" className={selected === 0 ? styles.selected : ''}>Studio</Link>
          <Link to="/feed" className={selected === 1 ? styles.selected : ''}>Feed</Link>
          <Link to="/discover" className={selected === 2 ? styles.selected : ''}>Discover</Link>
          <Link to={`/profile?username=${user.username}`} className={selected === 3 ? styles.selected : ''}>Profile</Link>
        </nav>
        <div className={styles.pictureWrapper}>
          <CircularImage src={profilePicUrl} />
          <div className={styles.signout} onClick={handleSignout} role="button" tabIndex={0}>
            <SignOutIcon />
          </div>
        </div>
      </span>
    </div>
  );
});

Header.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  selected: PropTypes.number.isRequired,
  studio: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  children: PropTypes.node,
};

Header.defaultProps = {
  children: null,
};

Header.displayName = 'Header';

const mapStateToProps = ({ user, studio }) => ({ user, studio });

export default withRouter(connect(mapStateToProps)(Header));
