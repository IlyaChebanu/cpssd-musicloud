/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import React, {
  useCallback, useMemo, memo, useState, useEffect, useRef,
} from 'react';
import cookie from 'js-cookie';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import toWav from 'audiobuffer-to-wav';
import _ from 'lodash';
import ReactTooltip from 'react-tooltip';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
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
import undoIcon from '../../assets/icons/undo-alt-light.svg';
import redoIcon from '../../assets/icons/redo-alt-light.svg';
import copyIcon from '../../assets/icons/copy-light.svg';
import pasteIcon from '../../assets/icons/paste-light.svg';
import deleteIcon from '../../assets/icons/trash-alt-light.svg';
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
  removeSample,
  setClipboard,
} from '../../actions/studioActions';
import Button from '../Button';
import Modal from '../Modal';

const Header = memo((props) => {
  const {
    selected, studio, children, dispatch, history, user, tracks, samples, studioUndoable,
  } = props;
  const { tempo } = studio;
  const [nameInput, setNameInput] = useState(studio.songName);
  const urlParams = new URLSearchParams(window.location.search);
  const songId = Number(urlParams.get('sid'));
  const [isLogoutShowing, setIsLogoutShowing] = useState(false);
  const [inputSelected, setInputSelected] = useState(false);
  const ref = useRef();
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
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('accept', 'audio/*');
    fileSelector.click();
    fileSelector.onchange = async () => {
      const sampleFile = fileSelector.files[0];
      const url = await uploadFile('audio', sampleFile);
      await saveFile(sampleFile.name, url);
      if (tracks.length === 0 || !studio.selectedTrack) {
        dispatch(
          showNotification({ message: 'Audio uploaded, check out the file explorer', type: 'info' }),
        );
        return;
      }
      const sampleState = {
        url,
        name: sampleFile.name,
        time: studio.currentBeat,
        fade: {
          fadeIn: 0,
          fadeOut: 0,
        },
      };
      dispatch(addSample(studio.selectedTrack, sampleState));
    };
  }, [dispatch, studio.currentBeat, studio.selectedTrack, tracks.length]);

  const handleAddSynth = useCallback(() => {
    if (tracks.length === 0) {
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
  }, [dispatch, studio.currentBeat, studio.selectedTrack, tracks.length]);

  const exportAction = useCallback(async () => {
    const renderedBuffer = await renderTracks(studio, studioUndoable);
    // eslint-disable-next-line no-underscore-dangle
    const encoded = toWav(renderedBuffer._buffer);
    forceDownload(
      [new DataView(encoded)],
      'audio/wav',
      `${studio.songName}.wav`,
    ); // for mp3 [new DataView] not needed
  }, [studio, studioUndoable]);

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
    if (_.isEmpty(tracks)) {
      dispatch(
        showNotification({ message: 'Please add a track first', type: 'info' }),
      );
      return false;
    }

    if (_.isEmpty(samples)) {
      dispatch(
        showNotification({ message: 'Please add a sample first', type: 'info' }),
      );
      return false;
    }
    return true;
  }, [dispatch, samples, tracks]);

  const handlePublishSong = useCallback(async () => {
    if (songId) {
      if (!tracksAndSamplesSet()) {
        return;
      }
      if (await handleSaveState()) {
        dispatch(showPublishForm());
        const renderedBuffer = await renderTracks(studio, studioUndoable);
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
  }, [songId, tracksAndSamplesSet, handleSaveState, dispatch, studio, studioUndoable]);

  const fileDropdownItems = useMemo(
    () => [
      {
        name: 'New', action: handleHideSongPicker, icon: newIcon, dataTip: 'Create a new song',
      },
      {
        name: 'Open', action: handleShowSongPicker, icon: openIcon, dataTip: 'Open an existing song',
      },
      {
        name: 'Publish', action: handlePublishSong, icon: publishIcon, dataTip: 'Publish the current song for everybody to see',
      },
      {
        name: 'Import', icon: importIcon, action: handleSampleImport, dataTip: 'Import and audio sample from this device',
      },
      {
        name: 'Add Synth', icon: importIcon, action: handleAddSynth, dataTip: 'Add a basic synthesizer to use with the piano roll',
      },
      {
        name: 'Export', icon: exportIcon, action: exportAction, dataTip: 'Export the current song as a single compiled audio',
      },
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
    () => {
      const items = [];
      if (studioUndoable.past.length) {
        items.push({
          name: 'Undo',
          icon: undoIcon,
          dataTip: 'Undo last change [ctrl+z]',
          action: () => dispatch(UndoActionCreators.undo()),
        });
      }
      if (studioUndoable.future.length) {
        items.push({
          name: 'Redo',
          icon: redoIcon,
          dataTip: 'Redo last change',
          action: () => dispatch(UndoActionCreators.redo()),
        });
      }
      if (studio.selectedSample) {
        items.push({
          name: 'Remove selected sample [delete/backspace]',
          icon: deleteIcon,
          dataTip: 'Remove currently selected sample',
          action: () => dispatch(removeSample(studio.selectedSample)),
        }, {
          name: 'Copy sample(s)',
          icon: copyIcon,
          dataTip: 'Copy selected sample(s) [ctrl+c]',
          action: () => {
            const clipSamples = studio.multipleSelectedSamples.map((sampleId) => samples[sampleId]);
            dispatch(setClipboard(clipSamples));
          },
        });
      }
      if (studio.clipboard.length) {
        items.push({
          name: 'Paste sample(s)',
          icon: pasteIcon,
          dataTip: 'Paste copied sample(s) [ctrl+v]',
          action: () => {
            const tracksInClipboard = [...new Set(studio.clipboard.map((s) => s.trackId))];

            let trackSamples;
            if (tracksInClipboard.length > 1) {
              trackSamples = Object.values(samples).filter(
                (s) => tracksInClipboard.includes(s.trackId),
              );
            } else {
              trackSamples = Object.values(samples).filter(
                (s) => s.trackId === studio.selectedTrack,
              );
            }
            const latestInTrack = _.maxBy(
              trackSamples,
              (o) => o.time + o.duration,
            ) || { time: 1, duration: 0 };
            const earliestInClipboard = _.minBy(studio.clipboard, (s) => s.time);

            studio.clipboard.forEach((clipSample) => {
              const newSample = { ...clipSample };

              newSample.time += (
                latestInTrack.time + latestInTrack.duration - earliestInClipboard.time
              );
              if (tracksInClipboard.length > 1) {
                dispatch(addSample(newSample.trackId, newSample));
              } else {
                dispatch(addSample(studio.selectedTrack, newSample));
              }
            });
          },
        });
      }
      return items;
    },
    [
      dispatch,
      samples,
      studio.clipboard,
      studio.multipleSelectedSamples,
      studio.selectedSample,
      studio.selectedTrack,
      studioUndoable.future.length,
      studioUndoable.past.length,
    ],
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
    setInputSelected(false);
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

  const openModal = (e) => {
    e.preventDefault();
    setIsLogoutShowing(true);
  };

  const closeModal = (e) => {
    e.preventDefault();
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
          data-tip={!inputSelected ? 'Change song name' : ''}
          data-place="bottom"
          data-for="tooltip"
          ref={(r) => { ref.current = r; }}
          type={!studio.songPickerHidden || selected !== 0 ? 'hidden' : 'text'}
          value={nameInput}
          onChange={handleChange}
          onMouseMove={() => {
            if (inputSelected) {
              ReactTooltip.hide(ref.current);
            }
          }}
          onClick={() => {
            setInputSelected(true);
            ReactTooltip.hide(ref.current);
          }}
          onBlur={handleSetName}
          onKeyDown={handleKeyDown}
          onMouseOver={ReactTooltip.rebuild}
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
  tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
  samples: PropTypes.object.isRequired,
  studioUndoable: PropTypes.object.isRequired,
};

Header.defaultProps = {
  children: null,
};

Header.displayName = 'Header';

const mapStateToProps = ({ user, studio, studioUndoable }) => ({
  user,
  studio,
  tracks: studioUndoable.present.tracks,
  samples: studioUndoable.present.samples,
  studioUndoable,
});

export default withRouter(connect(mapStateToProps)(Header));
