import PropTypes from 'prop-types';
import React, { useCallback, useMemo, memo } from 'react';
import cookie from 'js-cookie';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import styles from './Header.module.scss';
import { deleteToken } from '../../actions/userActions';
import { deleteToken as deleteTokenAPI, saveState, uploadFile } from '../../helpers/api';
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
import {
  setTrackAtIndex, setTracks, hideSongPicker, showSongPicker,
} from '../../actions/studioActions';

const Header = memo((props) => {
  const {
    selected, studio, children, dispatch, history,
  } = props;
  const { tempo, tracks, songId } = studio;

  const handleSaveState = useCallback(async () => {
    const songState = { tempo, tracks };
    /* At the moment, this just uses the hardcoded song ID in the state (1001). */
    /* The user who has edit permission for the song by default it Kamil. */
    /* You can add your uid and the sid 1001 to the Song_Editors table to */
    /* save from your account. */
    const res = await saveState(songId, songState);
    if (res.status === 200) {
      dispatch(showNotification({ message: 'Song saved', type: 'info' }));
    }
  }, [tempo, tracks, songId, dispatch]);

  function buildFileSelector() {
    // eslint-disable-next-line no-undef
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('accept', 'audio/*');
    return fileSelector;
  }

  const fileSelector = buildFileSelector();
  const handleSampleSelect = useCallback(() => {
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
  }, [dispatch, fileSelector, studio]);

  const handleShowSongPicker = useCallback(() => {
    dispatch(setTracks([]));
    dispatch(showSongPicker());
  }, [dispatch]);

  const handleHideSongPicker = useCallback(() => {
    dispatch(setTracks([]));
    dispatch(hideSongPicker());
  }, [dispatch]);

  const fileDropdownItems = [
    { name: 'New', action: handleHideSongPicker, icon: newIcon },
    { name: 'Open', action: handleShowSongPicker, icon: openIcon },
    { name: 'Publish', icon: publishIcon },
    { name: 'Save', icon: saveIcon, action: handleSaveState },
    { name: 'Import', icon: importIcon, action: handleSampleSelect },
    { name: 'Export', icon: exportIcon },
    { name: 'Generate', icon: generateIcon },
    { name: 'Exit', icon: exitIcon },
  ];
  const editDropdownItems = [
    { name: 'Edit 1' },
    { name: 'Edit 2' },
    { name: 'Edit 3' },
    { name: 'Edit 4' },
    { name: 'Edit 5' },
    { name: 'Edit 6' },
    { name: 'Edit 7' },
    { name: 'Edit 8' },
  ];

  const handleSignout = useCallback(
    () => {
      deleteTokenAPI();
      cookie.remove('token');
      dispatch(deleteToken);
      history.push('/login');
    },
    [dispatch, history],
  );

  return (
    <div className={styles.header}>
      <Logo className={styles.logo} />
      <div className={selected !== 0 ? styles.hide : styles.dropdownBlock}>
        <Dropdown items={fileDropdownItems} title="File" />
        <Dropdown items={editDropdownItems} title="Edit" />
        {children}
      </div>
      <p className={styles.songName}>Song name</p>
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
