import React, {
  useState, useCallback, memo, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { uploadFile, deleteFile } from 'react-s3';
import {
  setSelectedFile,
  addSample as addSampleAction,
} from '../../actions/studioActions';
import { generatePresigned } from '../../helpers/api';
import { ReactComponent as SampleIcon } from '../../assets/icons/music_note-24px.svg';
import styles from './File.module.scss';
import { ReactComponent as Delete } from '../../assets/icons/delete_outline-24px.svg';
import { showNotification } from '../../actions/notificationsActions';

const File = memo((props) => {
  const {
    dir, selectedFile, dispatch, studio, selectedTrack,
  } = props;
  const [deleted, setDeleted] = useState(false);
  const level = dir.split('/').length - 2;
  const extension = dir.split('/').pop().split('.').length === 0 ? '' : dir.split('/').pop().split('.').pop();
  const oldName = useRef(dir.split('/').pop().split('.')[0]);
  const [newName, setNewName] = useState(oldName.current);
  const path = dir.split('/').slice(0, dir.split('/').length - 1).join('/');
  const url = 'https://dcumusicloudbucket.s3-eu-west-1.amazonaws.com/';
  const [config, setConfig] = useState({
    bucketName: 'dcumusicloudbucket',
    secretAccessKey: 'XVdgFyhjyhnqicDxxXZa9rLouFv5WQdXzXwxrP0u',
    region: 'eu-west-1',
  });

  const awsConfig = useCallback(async (directory) => {
    const res = await generatePresigned('/');
    if (res.status === 200) {
      const accessKey = res.data.signed_url.fields.AWSAccessKeyId;
      config.accessKeyId = accessKey;
      config.dirName = directory;
      setConfig(config);
    }
  }, [config]);

  const handleFileNameChange = useCallback((e) => {
    e.preventDefault();
    dispatch(setSelectedFile(`${path}/${e.target.value}`));
    setNewName(e.target.value);
  }, [dispatch, path]);

  const fileClick = useCallback(() => {
    if (selectedFile === `${path}/${newName}`) {
      dispatch(setSelectedFile(''));
    } else {
      dispatch(setSelectedFile(`${path}/${newName}`));
    }
    // setSelectedFolder(`${path}`);
  }, [dispatch, newName, path, selectedFile]);


  const deleteFromS3 = useCallback(async (directory, file) => {
    await awsConfig(directory);
    deleteFile(file.split('/').pop(), config)
      .then(() => { setDeleted(true); })
      .catch();
  }, [awsConfig, config]);


  // const uploadToS3 = useCallback(async (oldFileName, newFileName) => {
  //   await awsConfig(path);
  //   await deleteFromS3(path, extension === '' ? oldFileName : `${oldFileName}.${extension}`);
  //   uploadFile(newFileName, config)
  //     .then()
  //     .catch();
  // }, [awsConfig, config, deleteFromS3, extension, path]);

  const onInputBlur = async (e, key) => {
    if (key === 13) {
      // uploadToS3(oldName.current, newName);
      oldName.current = newName;
      setNewName(e.target.value);
      e.target.blur();
    } else {
      setNewName(oldName.current);
    }
  };

  const addSample = useCallback(
    (name) => {
      dispatch(setSelectedFile(''));
      if (studio.tracks.length === 0) {
        dispatch(
          showNotification({
            message: 'Please add a track first',
            type: 'info',
          }),
        );
        return;
      }
      if (selectedTrack === 0) {
        dispatch(
          showNotification({
            message: 'Please select a track first',
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
    [dispatch, selectedTrack, studio.currentBeat, studio.selectedTrack, studio.tracks.length],
  );


  return (
    <div>
      {!deleted
        ? (
          <li
            style={{ marginLeft: `${level * 25}px` }}
            onBlur={(e) => setSelectedFile(`${path}/${e.target.value}`)}
            onClick={(e) => {
              addSample(extension === '' ? `${path}/${oldName.current}` : `${path}/${oldName.current}.${extension}`);
              e.preventDefault(); fileClick();
            }}
            className={selectedFile === `${path}/${newName}` ? styles.selected : ''}
          >
            <SampleIcon style={{ paddingRight: '4px', fill: 'white' }} />
            <form onSubmit={(e) => { e.preventDefault(); }}>
              <input
                onBlur={(e) => { onInputBlur(e, -1); }}
                onKeyDown={(e) => {
                  if (e.keyCode === 13) {
                    onInputBlur(e, e.keyCode);
                  }
                  // Skip dot, comma, slash, backslash
                  if (e.keyCode === 190 || e.keyCode === 191
                     || e.keyCode === 188 || e.keyCode === 220) {
                    e.preventDefault();
                  }
                }}
                style={{ cursor: selectedFile !== `${path}/${newName}` ? 'pointer' : '' }}
                onChange={handleFileNameChange}
                value={newName}
                onClick={(e) => { if (selectedFile === `${path}/${newName}`) { e.stopPropagation(); } }}
                disabled={!selectedFile === `${path}/${newName}`}
              />
            </form>

            <Delete
              style={{ visibility: selectedFile === `${path}/${newName}` ? 'visible' : 'hidden' }}
              className={styles.deleteFile}
              onClick={(e) => { e.stopPropagation(); deleteFromS3(path, extension === '' ? newName : `${newName}.${extension}`); }}
            />

          </li>
        )
        : null }
    </div>
  );
});

File.propTypes = {
  studio: PropTypes.object.isRequired,
  dir: PropTypes.string.isRequired,
  selectedFile: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  selectedTrack: PropTypes.string.isRequired,
};

const mapStateToProps = ({ studio }) => ({
  selectedTrack: studio.selectedTrack,
  selectedFile: studio.selectedFile,
  studio,

});

export default withRouter(connect(mapStateToProps)(File));
