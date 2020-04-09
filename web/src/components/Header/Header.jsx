/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import React, {
  useCallback, useMemo, memo, useState, useEffect,
} from 'react';
import cookie from 'js-cookie';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import toWav from 'audiobuffer-to-wav';
import _ from 'lodash';
import styles from './Header.module.scss';
import { deleteToken } from '../../actions/userActions';
import {
  deleteToken as deleteTokenAPI,
  saveState,
  getSongState,
  uploadFile,
  createNewSong,
  patchSongName,
  setSongCompiledUrl,
  saveFile,
} from '../../helpers/api';
import { showNotification } from '../../actions/notificationsActions';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import CircularImage from '../CircularImage';
import Dropdown from '../Dropdown';

import newIcon from '../../assets/icons/file_dropdown/new.svg';
import openIcon from '../../assets/icons/file_dropdown/open.svg';
import publishIcon from '../../assets/icons/file_dropdown/publish.svg';
import importIcon from '../../assets/icons/file_dropdown/import.svg';
import exportIcon from '../../assets/icons/file_dropdown/export.svg';
import { renderTracks } from '../../middleware/audioRedux';
import { forceDownload } from '../../helpers/utils';
import {
  hideSongPicker,
  showSongPicker,
  setTempo,
  setSongName,
  stop,
  showPublishForm,
  addSample,
  setShowPianoRoll,
  hideSampleEffects,
  setCompleteTracksState,
  setCompleteSamplesState,
} from '../../actions/studioActions';
import Button from '../Button';
import Modal from '../Modal';

const Header = memo((props) => {
  const {
    selected, studio, children, dispatch, history, user,
  } = props;
  const { tempo, tracks, samples } = studio;
  const [nameInput, setNameInput] = useState(studio.songName);
  const urlParams = new URLSearchParams(window.location.search);
  const songId = Number(urlParams.get('sid'));
  const [isLogoutShowing, setIsLogoutShowing] = useState(false);
  const cleanSongSampleBuffers = (state) => {
    state.tracks.forEach((track) => {
      if (track.samples !== undefined) {
        track.samples.forEach((sample) => {
          sample.buffer = {};
        });
      }
    });

    return state;
  };

  const handleSaveState = useCallback(async () => {
    if (!songId) return true;
    const songState = { tempo, tracks, samples };
    let res = await getSongState(songId);
    if (res.status === 200) {
      const prevState = res.data.song_state;
      if (_.isEqual(cleanSongSampleBuffers(songState), prevState)) return true;
    } else {
      dispatch(showNotification({ message: 'Unknown error has occured.' }));
    }
    res = await saveState(songId, songState);
    if (res.status === 200) {
      dispatch(showNotification({ message: 'Song saved', type: 'info' }));
      return true;
    }
    return false;
  }, [songId, tempo, tracks, samples, dispatch]);

  const handleSampleImport = useCallback(() => {
    if (studio.tracks.length === 0) {
      dispatch(
        showNotification({ message: 'Please add a track first', type: 'info' }),
      );
      return;
    }
    if (!studio.selectedTrack) {
      dispatch(
        showNotification({ message: 'Please select a track first', type: 'info' }),
      );
      return;
    }
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('accept', 'audio/*');
    fileSelector.click();
    fileSelector.onchange = async () => {
      const sampleFile = fileSelector.files[0];
      const url = await uploadFile('audio', sampleFile);
      const sampleState = {
        url,
        name: sampleFile.name,
        time: studio.currentBeat,
        fade: {
          fadeIn: 0,
          fadeOut: 0,
        },
      };
      await saveFile(sampleFile.name, url)
      dispatch(addSample(studio.selectedTrack, sampleState));
    };
  }, [dispatch, studio]);

  const handleAddSynth = useCallback(() => {
    if (studio.tracks.length === 0) {
      dispatch(
        showNotification({ message: 'Please add a track first', type: 'info' }),
      );
      return;
    }
    if (!studio.selectedTrack) {
      dispatch(
        showNotification({ message: 'Please select a track first', type: 'info' }),
      );
      return;
    }
    dispatch(addSample(
      studio.selectedTrack,
      {
        name: 'synth',
        time: studio.currentBeat,
        fade: {
          fadeIn: 0,
          fadeOut: 0,
        },
        type: 'pattern',
        duration: 0,
        notes: [],
      },
    ));
  }, [dispatch, studio.currentBeat, studio.selectedTrack, studio.tracks.length]);

  const exportAction = useCallback(async () => {
    const renderedBuffer = await renderTracks(studio);
    // eslint-disable-next-line no-underscore-dangle
    const encoded = toWav(renderedBuffer._buffer);
    forceDownload(
      [new DataView(encoded)],
      'audio/wav',
      `${studio.songName}.wav`,
    ); // for mp3 [new DataView] not needed
  }, [studio]);

  const handleShowSongPicker = useCallback(async () => {
    if (await handleSaveState()) {
      dispatch(stop);
      dispatch(setCompleteTracksState([]));
      dispatch(setCompleteSamplesState({}));
      window.history.pushState(null, null, '/studio');
      dispatch(setSongName('New Song'));
      dispatch(setTempo(140));
      dispatch(showSongPicker());
    }
    dispatch(setShowPianoRoll(false));
    dispatch(hideSampleEffects());
  }, [dispatch, handleSaveState]);

  const handleHideSongPicker = useCallback(async () => {
    if (await handleSaveState()) {
      const res = await createNewSong('New Song');
      if (res.status === 200) {
        dispatch(stop);
        dispatch(setCompleteTracksState([]));
        dispatch(setCompleteSamplesState({}));
        window.history.pushState(null, null, `/studio?sid=${res.data.sid}`);
        dispatch(setTempo(140));
        dispatch(setSongName('New Song'));
        dispatch(hideSongPicker());
      }
    }
  }, [dispatch, handleSaveState]);

  const tracksAndSamplesSet = useCallback(() => {
    if (_.isEmpty(studio.tracks)) {
      dispatch(
        showNotification({ message: 'Please add a track first', type: 'info' }),
      );
      return false;
    }

    if (_.isEmpty(studio.samples)) {
      dispatch(
        showNotification({ message: 'Please add a sample first', type: 'info' }),
      );
      return false;
    }
    return true;
  }, [dispatch, studio.samples, studio.tracks]);

  const handlePublishSong = useCallback(async () => {
    if (songId) {
      if (!tracksAndSamplesSet()) {
        return;
      }
      if (await handleSaveState()) {
        dispatch(showPublishForm());
        const renderedBuffer = await renderTracks(studio);
        const encoded = toWav(renderedBuffer);
        const res = await uploadFile(
          'compiled_audio',
          new File([encoded], `${studio.songName}.wav`, { type: 'audio/wav' }),
        );
        const songData = {
          url: res,
          sid: songId,
          duration: 1,
        };
        setSongCompiledUrl(songData);
      }
    }
  }, [dispatch, handleSaveState, studio, tracksAndSamplesSet, songId]);

  const fileDropdownItems = useMemo(
    () => [
      { name: 'New', action: handleHideSongPicker, icon: newIcon },
      { name: 'Open', action: handleShowSongPicker, icon: openIcon },
      { name: 'Publish', action: handlePublishSong, icon: publishIcon },
      { name: 'Import', icon: importIcon, action: handleSampleImport },
      { name: 'Add Synth', icon: importIcon, action: handleAddSynth },
      { name: 'Export', icon: exportIcon, action: exportAction },
    ],
    [
      exportAction,
      handleAddSynth,
      handleHideSongPicker,
      handlePublishSong,
      handleSampleImport,
      handleShowSongPicker,
    ],
  );

  const editDropdownItems = useMemo(
    () => [
      { name: 'Edit 1' },
      { name: 'Edit 2' },
      { name: 'Edit 3' },
      { name: 'Edit 4' },
      { name: 'Edit 5' },
      { name: 'Edit 6' },
      { name: 'Edit 7' },
      { name: 'Edit 8' },
    ],
    [],
  );

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
    const res = patchSongName(songId, nameInput);
    return res.status === 200;
  }, [dispatch, nameInput, songId]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        handleSetName();
      }
    },
    [handleSetName],
  );

  const openModal = () => {
    setIsLogoutShowing(true);
  };

  const closeModal = () => {
    setIsLogoutShowing(false);
  };

  const logOutModal = useMemo(() => (
    <div className={styles.modal} style={{ visibility: isLogoutShowing ? 'visible' : 'hidden' }}>
      { isLogoutShowing ? <div role="none" onClick={closeModal} className={styles.backDrop} /> : null}
      <Modal
        header="Confirm logging out"
        className={styles.modal}
        show={isLogoutShowing}
        close={closeModal}
        submit={handleSignout}
      >
        Are you sure you want to logout?
      </Modal>
    </div>
  ), [handleSignout, isLogoutShowing]);


  return (
    <div className={styles.header}>
      <span className={styles.left}>
        <Logo className={styles.logo} />
        <div
          className={
            !studio.songPickerHidden || selected !== 0
              ? styles.hide
              : styles.dropdownBlock
          }
        >
          <Dropdown items={fileDropdownItems} title="File" />
          <Dropdown items={editDropdownItems} title="Edit" />
          {children}
        </div>
      </span>
      <span className={styles.songName}>
        <input
          type={!studio.songPickerHidden || selected !== 0 ? 'hidden' : 'text'}
          value={nameInput}
          onChange={handleChange}
          onBlur={handleSetName}
          onKeyDown={handleKeyDown}
        />
      </span>
      <span className={styles.nav}>
        <nav>
          <Button className={styles.saveButton} onClick={openModal}>
            Logout
          </Button>

          <Link to="/studio" className={selected === 0 ? styles.selected : ''}>
            Studio
          </Link>
          <Link to="/feed" className={selected === 1 ? styles.selected : ''}>
            Feed
          </Link>
          <Link
            to="/discover"
            className={selected === 2 ? styles.selected : ''}
          >
            Discover
          </Link>
        </nav>
        <div className={styles.pictureWrapper}>
          <CircularImage src={user.profilePicUrl} />
          <Link
            className={styles.signout}
            to={`/profile?username=${user.username}`}
            role="button"
            tabIndex={0}
          />
        </div>
      </span>
      {logOutModal}
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
