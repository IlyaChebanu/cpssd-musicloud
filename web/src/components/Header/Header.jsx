import React, { useCallback, useState, memo } from 'react';
import cookie from 'js-cookie';
import PropTypes from 'prop-types';
import styles from './Header.module.scss';
import {deleteToken, setToken} from '../../actions/userActions';
import {deleteToken as deleteTokenAPI, saveState} from '../../helpers/api';
import { showNotification } from '../../actions/notificationsActions';
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


const Header = memo(props => {

  const func = () => {
    console.log("action New")
  };

  const handleSaveState = useCallback(async () => {
    const songState = {
      tempo: props.studio.tempo,
      tracks: props.studio.tracks
    };
    console.log(songState);
    const res = await saveState(props.studio.songId, songState);
    try {
        if (res.status === 200) {
          showNotification({message: 'Song Saved'});
        } else if (res.status === 401) {
          showNotification({message: 'Invalid credentails'});
        } else if (res.status === 403) {
          showNotification({message: 'You are not permitted to edit this song'});
        } else {
          showNotification({message: 'Unknown error has occurred'});
          console.error(res);
        }
      } catch (e) {
          showNotification('Fatal error');
          console.error(e);
      }
  }, [props.studio]);

  const fileDropdownItems = [
    {name: "New", action: func, icon: newIcon},
    {name: "Open", icon: openIcon},
    {name: "Publish", icon: publishIcon},
    {name: "Save", icon: saveIcon, action: handleSaveState},
    {name: "Import", icon: importIcon},
    {name: "Export", icon: exportIcon},
    {name: "Generate", icon: generateIcon},
    {name: "Exit", icon: exitIcon},
  ];
  const editDropdownItems = [
    {name: "Edit 1"},
    {name: "Edit 2"},
    {name: "Edit 3"},
    {name: "Edit 4"},
    {name: "Edit 5"},
    {name: "Edit 6"},
    {name: "Edit 7"},
    {name: "Edit 8"},
  ];
  const { dispatch, history } = props;
  const { token } = props.user;

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
      {/* <span> */}
        <Logo className={styles.logo}/>
        <div className={props.selected !== 0 ? styles.hide : styles.dropdownBlock}>
          <Dropdown items={fileDropdownItems} title="File"/>
          <Dropdown items={editDropdownItems} title="Edit"/>
        </div>
        {/* {props.children} */}
      {/* </span> */}
      <span>

        <nav>
          <Link to='/studio' className={props.selected === 0 ? styles.selected : ''}>Studio</Link>
          <Link to='/discover' className={props.selected === 1 ? styles.selected : ''}>Discover</Link>
          <Link to='/profile' className={props.selected === 2 ? styles.selected : ''}>Profile</Link>
        </nav>
        <div className={styles.pictureWrapper}>
          <CircularImage src={ProfilePicture}/>
          <div className={styles.signout} onClick={handleSignout}>
            <SignOutIcon />
          </div>
        </div>
      </span>
    </div>
  );
});

Header.propTypes = {

};

const mapStateToProps = ({ user, studio }) => ({ user, studio });

export default withRouter(connect(mapStateToProps)(Header));
