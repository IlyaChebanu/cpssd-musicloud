import React, {
  useState, useCallback, useMemo, memo,
} from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import AWS from 'aws-sdk';
import * as s3ls from 's3-ls';
import styles from './FileExplorer.module.scss';
import samplesIcon from '../../assets/icons/samples.svg';
import instrumentsIcon from '../../assets/icons/instruments.svg';
import { generatePresigned } from '../../helpers/api';
import store from '../../store';
import {
  setTrackAtIndex,
  setSampleLoading,
} from '../../actions/studioActions';
import { showNotification } from '../../actions/notificationsActions';

import { genId } from '../../helpers/utils';

const FileExplorer = memo((props) => {
  const { studio, dispatch } = props;
  const [list, setList] = useState([]);
  const [url, setUrl] = useState('');

  async function getFiles() {
    const res = await generatePresigned('/');
    const accessKey = res.data.signed_url.fields.AWSAccessKeyId;
    AWS.config.update({
      accessKeyId: accessKey,
      secretAccessKey: 'XVdgFyhjyhnqicDxxXZa9rLouFv5WQdXzXwxrP0u',
      region: 'eu-west-1',
    });
    setUrl('https://dcumusicloudbucket.s3-eu-west-1.amazonaws.com/');
    const { user } = store.getState();
    const lister = s3ls({
      bucket: 'dcumusicloudbucket',
    });

    const { files } = await lister.ls(`/audio/${user.username}`);
    setList(files);
  }

  const addSample = useCallback(
    (name) => {
      if (studio.tracks.length === 0) {
        dispatch(
          showNotification({
            message: 'Please add a track first',
            type: 'info',
          }),
        );
        return;
      }
      const track = { ...studio.tracks[studio.selectedTrack] };
      const sampleState = {
        url: url + name,
        name,
        id: genId(),
        time: studio.currentBeat,
        track: studio.selectedTrack,
        fade: {
          fadeIn: 0,
          fadeOut: 0,
        },
        reverb: {
          wet: 1,
          dry: 1,
          cutoff: 0,
          time: 0.3,
        },
      };
      track.samples.push(sampleState);
      dispatch(setTrackAtIndex(track, studio.selectedTrack));
      // dispatch(setSampleTime(sampleState.time, sampleState.id));
      dispatch(setSampleLoading(true));
      // dispatch(setTracks(studio.tracks));
    },
    [studio.tracks, studio.selectedTrack, studio.currentBeat, url, dispatch],
  );

  const Files = () => (
    <div>
      <ul>
        <li key="Samples" onClick={getFiles}>
          {samplesIcon && (
          <img
            className={styles.icon}
            src={samplesIcon}
            alt="Samples icon"
          />
          )}
          <p>Samples</p>
        </li>
      </ul>
      {list.map((item) => (
        <li onClick={() => addSample(item)} className={styles.li}>
          {item.split('/').pop()}
        </li>
      ))}
    </div>
  );

  const instruments = [
    { name: 'Instruments', action: null, icon: instrumentsIcon },
  ];

  const explorerItems = useMemo(
    () => instruments.map((item) => (
      <li
        key={item.name}
        onMouseDown={() => {
          if (item.action) item.action();
        }}
      >
        {item.icon && (
        <img
          className={styles.icon}
          src={item.icon}
          alt="explorer item icon"
        />
        )}
        <p>{item.name}</p>
      </li>
    )),
    [instruments],
  );

  return (
    <div
      style={{ visibility: props.fileExplorerHidden ? 'hidden' : 'visible' }}
      className={styles.explorer}
    >
      <ul>
        <Files />
        {explorerItems}
      </ul>
    </div>
  );
});

FileExplorer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  studio: PropTypes.object.isRequired,
  fileExplorerHidden: PropTypes.bool.isRequired,
};

FileExplorer.displayName = 'FileExplorer';

const mapStateToProps = ({ studio }) => ({
  fileExplorerHidden: studio.fileExplorerHidden,
  studio,
});

export default withRouter(connect(mapStateToProps)(FileExplorer));
