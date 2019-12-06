/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, memo } from 'react';
import cookie from 'js-cookie';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import _ from 'lodash';
import toWav from 'audiobuffer-to-wav';
import styles from './Header.module.scss';
import { deleteToken } from '../../actions/userActions';
import {
  deleteToken as deleteTokenAPI, saveState, uploadFile, createNewSong,
} from '../../helpers/api';
import { showNotification } from '../../actions/notificationsActions';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import { ReactComponent as SignOutIcon } from '../../assets/icons/sign-out-alt-light.svg';
import ProfilePicture from '../../assets/profiler.jpg';
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
import { encodeMp3, forceDownload } from '../../helpers/utils';
import {
  setTrackAtIndex, setTracks, hideSongPicker, showSongPicker, setTempo, setSongName, setSongId,
} from '../../actions/studioActions';

const Header = memo((props) => {
  const {
    selected, studio, children, dispatch, history,
  } = props;
  const { tempo, tracks, songId } = studio;

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


  const handleSampleSelect = useCallback(() => {
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('accept', 'audio/*');
    fileSelector.click();
    fileSelector.onchange = function onChange() {
      const url = uploadFile('audio', fileSelector.files[0], cookie.get('token'));

      const cast = Promise.resolve(url);
      cast.then(() => {
        const state = studio;
        const track = { ...state.tracks[state.selectedTrack] };
        track.samples.push({
          url: fileSelector.files[0],
          id: 1156,
          time: 10,
        });

        dispatch(setTrackAtIndex(track, state.selectedTrack));
      });
    };
  }, [dispatch, studio]);

  const exportAction = useCallback(async () => {
    const renderedBuffer = await renderTracks(studio);
    const encoded = toWav(renderedBuffer);

    forceDownload([new DataView(encoded)], 'audio/wav', `${studio.title}.wav`); // for mp3 [new DataView] not needed
  }, [studio]);

  const handleShowSongPicker = useCallback(async () => {
    if (await handleSaveState()) {
      dispatch(setSongName('New Song'));
      dispatch(setTracks([]));
      dispatch(setTempo(140));
      dispatch(showSongPicker());
    }
  }, [dispatch, handleSaveState]);

  const handleHideSongPicker = useCallback(async () => {
    if (await handleSaveState()) {
      const res = await createNewSong('New Song');
      if (res.status === 200) {
        dispatch(setSongId(res.data.sid));
        dispatch(setTracks([]));
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
    { name: 'Import', icon: importIcon, action: handleSampleSelect },
    { name: 'Export', icon: exportIcon, action: exportAction },
    { name: 'Generate', icon: generateIcon },
    { name: 'Exit', icon: exitIcon },
  ], [
    exportAction,
    handleHideSongPicker,
    handleSampleSelect,
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

  const songNameStyle = useMemo(() => ({ visibility: selected !== 0 ? 'hidden' : 'visible' }), [selected]);

  return (
    <div className={styles.header}>
      <Logo className={styles.logo} />
      <div className={selected !== 0 ? styles.hide : styles.dropdownBlock}>
        <Dropdown items={fileDropdownItems} title="File" />
        <Dropdown items={editDropdownItems} title="Edit" />
        {children}
      </div>
      <div className={styles.songName}>
        <p style={songNameStyle}>
          {studio.songName}
        </p>
      </div>
      <span>
        <nav>
          <Link to="/studio" className={selected === 0 ? styles.selected : ''}>Studio</Link>
          <Link to="/discover" className={selected === 1 ? styles.selected : ''}>Discover</Link>
          <Link to="/profile" className={selected === 2 ? styles.selected : ''}>Profile</Link>
        </nav>
        <div className={styles.pictureWrapper}>
          <CircularImage src={ProfilePicture} />
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
  children: PropTypes.node,
};

Header.defaultProps = {
  children: null,
};

Header.displayName = 'Header';

const mapStateToProps = ({ user, studio }) => ({ user, studio });

export default withRouter(connect(mapStateToProps)(Header));
