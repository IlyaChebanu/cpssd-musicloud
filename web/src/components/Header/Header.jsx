import React, { useCallback, memo } from 'react';
import cookie from 'js-cookie';
import styles from './Header.module.scss';
import { deleteToken } from '../../actions/userActions';
import { deleteToken as deleteTokenAPI } from '../../helpers/api';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import { ReactComponent as SignOutIcon } from '../../assets/icons/sign-out-alt-light.svg';
import ProfilePicture from '../../assets/profiler.jpg';
import CircularImage from '../CircularImage';
import Dropdown from '../../components/Dropdown';

import newIcon from '../../assets/icons/file_dropdown/new.svg';
import openIcon from '../../assets/icons/file_dropdown/open.svg';
import publishIcon from '../../assets/icons/file_dropdown/publish.svg';
import saveIcon from '../../assets/icons/file_dropdown/save.svg';
import importIcon from '../../assets/icons/file_dropdown/import.svg';
import exportIcon from '../../assets/icons/file_dropdown/export.svg';
import generateIcon from '../../assets/icons/file_dropdown/generate.svg';
import exitIcon from '../../assets/icons/file_dropdown/exit.svg';
import { uploadFile } from '../../helpers/api';
import { setTrackAtIndex } from '../../actions/studioActions';
import store from '../../store'

const Header = memo(props => {

  function buildFileSelector() {
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('accept', 'audio/*');
    return fileSelector;
  }



  const fileSelector = buildFileSelector();
  const { dispatch, history } = props;
  const { token } = props.user;
  const handleSampleSelect = useCallback(() => {

    fileSelector.click();
    fileSelector.onchange = function () {
      const url = uploadFile("audio", fileSelector.files[0], cookie.get("token"));

      var sampleUrl = '';
      var cast = Promise.resolve(url);
      cast.then(function (value) {

        var state = store.getState().studio


        var track = { ...state.tracks[state.selectedTrack] }
        track.samples.push({
          url: fileSelector.files[0],
          id: 1156,
          time: 10,
        })

        props.dispatch(setTrackAtIndex(track, state.selectedTrack))
      })
    }

  });


  const fileDropdownItems = [
    { name: "New", action: null, icon: newIcon },
    { name: "Open", icon: openIcon },
    { name: "Publish", icon: publishIcon },
    { name: "Save", icon: saveIcon },
    { name: "Import", icon: importIcon, action: handleSampleSelect },
    { name: "Export", icon: exportIcon },
    { name: "Generate", icon: generateIcon },
    { name: "Exit", icon: exitIcon },
  ]
  const editDropdownItems = [
    { name: "Edit 1" },
    { name: "Edit 2" },
    { name: "Edit 3" },
    { name: "Edit 4" },
    { name: "Edit 5" },
    { name: "Edit 6" },
    { name: "Edit 7" },
    { name: "Edit 8" },
  ]


  const handleSignout = useCallback(
    () => {
      cookie.remove('token');
      dispatch(deleteToken);
      deleteTokenAPI(token);
      history.push('/login');
    },
    [dispatch, history, token],
  );

  return (
    <div className={styles.header}>
      <Logo className={styles.logo} />
      <div className={props.selected !== 0 ? styles.hide : styles.dropdownBlock}>
        <Dropdown items={fileDropdownItems} title="File" />
        <Dropdown items={editDropdownItems} title="Edit" />
      </div>
      <span>

        <nav>
          <Link to='/studio' className={props.selected === 0 ? styles.selected : ''}>Studio</Link>
          <Link to='/discover' className={props.selected === 1 ? styles.selected : ''}>Discover</Link>
          <Link to='/profile' className={props.selected === 2 ? styles.selected : ''}>Profile</Link>
        </nav>
        <div className={styles.pictureWrapper}>
          <CircularImage src={ProfilePicture} />
          <div className={styles.signout} onClick={handleSignout}>
            <SignOutIcon />
          </div>
        </div>
      </span>
    </div>
  );
});


const mapStateToProps = ({ state, user, studio }) => ({ state, user, studio, tracks: studio.tracks });

export default withRouter(connect(mapStateToProps)(Header));

