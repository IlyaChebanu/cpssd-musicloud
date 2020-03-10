import React, {
  useState, useCallback, useMemo, memo, useRef, useEffect,
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
  hideFileExplorer,
  addSample as addSampleAction,
} from '../../actions/studioActions';
import { showNotification } from '../../actions/notificationsActions';


const FileExplorer = memo((props) => {
  const { studio, dispatch } = props;
  const [list, setList] = useState([]);
  const [url, setUrl] = useState('');
  const node = useRef();

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
      const sampleState = {
        url: url + name,
        name,
        time: studio.currentBeat,
        fade: {
          fadeIn: 0,
          fadeOut: 0,
        },
      };
      dispatch(addSampleAction(studio.selectedTrack, sampleState));
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
        <li onClick={(e) => { e.preventDefault(); addSample(item); }} className={styles.li}>
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

  const handleClick = useCallback((e) => {
    try {
      if (node.current.contains(e.target)
      || (e.target.id === 'explorer')
      || (e.toElement.viewportElement.id === 'explorer')) {
      // inside click or click on file explorer button
        return;
      }
    } catch (err) {
      // outside click
      if (!props.fileExplorerHidden) {
        dispatch(hideFileExplorer());
      }
    }
  }, [dispatch, props.fileExplorerHidden]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [handleClick]);

  return (
    <div
      ref={node}
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
