import PropTypes from 'prop-types';
import React, { useCallback, useState, memo } from 'react';
import cookie from 'js-cookie';
import styles from './Header.module.scss';
import {deleteToken, setToken} from '../../actions/userActions';
import {deleteToken as deleteTokenAPI, saveState} from '../../helpers/api';
import { showNotification } from '../../actions/notificationsActions';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import styles from './Header.module.scss';
import { deleteToken } from '../../actions/userActions';
import { deleteToken as deleteTokenAPI, uploadFile } from '../../helpers/api';
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

const Header = memo((props) => {
  const handleSaveState = useCallback(async () => {
    const songState = {
      tempo: props.studio.tempo,
      tracks: props.studio.tracks
    };
    /* At the moment, this just uses the hardcoded song ID in the state (1001). */
    /* The user who has edit permission for the song by default it Kamil. */
    /* You can add your uid and the sid 1001 to the Song_Editors table to */
    /* save from your account. */
    const res = await saveState(props.studio.songId, songState);
      if (res.status === 200) {
        store.dispatch(showNotification({message: 'Song saved', type: 'info'}));
      }
  }, [props.studio.tempo, props.studio.tracks, props.studio.songId]);

  function buildFileSelector() {
    // eslint-disable-next-line no-undef
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('accept', 'audio/*');
    return fileSelector;
  }

  const fileSelector = buildFileSelector();
  const { dispatch, history } = props;
  const handleSampleSelect = useCallback(() => {
    fileSelector.click();
    fileSelector.onchange = function onChange() {
      const url = uploadFile('audio', fileSelector.files[0], cookie.get('token'));

      const cast = Promise.resolve(url);
      cast.then(() => {
        const state = store.getState().studio;

        var state = store.getState().studio;


        var track = { ...state.tracks[state.selectedTrack] };
        track.samples.push({
          url: fileSelector.files[0],
          id: 1156,
          time: 10,
        });

        dispatch(setTrackAtIndex(track, state.selectedTrack));
      });
    };
  }, [dispatch, fileSelector]);


  const fileDropdownItems = [
    { name: "New", action: null, icon: newIcon },
    { name: "Open", icon: openIcon },
    { name: "Publish", icon: publishIcon },
    { name: "Save", icon: saveIcon, action: handleSaveState },
    { name: "Import", icon: importIcon, action: handleSampleSelect },
    { name: "Export", icon: exportIcon },
    { name: "Generate", icon: generateIcon },
    { name: "Exit", icon: exitIcon },
  ];
  const editDropdownItems = [
    { name: "Edit 1" },
    { name: "Edit 2" },
    { name: "Edit 3" },
    { name: "Edit 4" },
    { name: "Edit 5" },
    { name: "Edit 6" },
    { name: "Edit 7" },
    { name: "Edit 8" },
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
      <div className={props.selected !== 0 ? styles.hide : styles.dropdownBlock}>
        <Dropdown items={fileDropdownItems} title="File" />
        <Dropdown items={editDropdownItems} title="Edit" />
        {props.children}
      </div>
      <span>

        <nav>
          <Link to="/studio" className={props.selected === 0 ? styles.selected : ''}>Studio</Link>
          <Link to="/discover" className={props.selected === 1 ? styles.selected : ''}>Discover</Link>
          <Link to="/profile" className={props.selected === 2 ? styles.selected : ''}>Profile</Link>
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
  history: PropTypes.objectOf(PropTypes.object).isRequired,
  selected: PropTypes.number.isRequired,
};

Header.defaultProps = {

};

const mapStateToProps = ({ user }) => ({ user });

export default withRouter(connect(mapStateToProps)(Header));
