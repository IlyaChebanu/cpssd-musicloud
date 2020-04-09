import React, {
  useState, useCallback, memo,
} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { deleteFile } from 'react-s3';
import {
  setSelectedFile,
  addSample as addSampleAction,
} from '../../actions/studioActions';
import { generatePresigned, deleteSampleFile, renameFile } from '../../helpers/api';
import { ReactComponent as SampleIcon } from '../../assets/icons/music_note-24px.svg';
import styles from './File.module.scss';
import { ReactComponent as Delete } from '../../assets/icons/delete_outline-24px.svg';
import { showNotification } from '../../actions/notificationsActions';

const File = memo((props) => {
  const {
    dir, level, selectedFile, dispatch, studio, selectedTrack,
  } = props;
  const [deleted, setDeleted] = useState(false);
  const url = dir['url'];
  const urlArray = url.split('.')
  const extension = urlArray[urlArray.length-1];
  const oldName = {current: dir['name']};
  const [newName, setNewName] = useState(oldName.current);
  let pathDir = urlArray[3].split('/');
  const path = pathDir[1] + pathDir[2];
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
  }, [dispatch, newName, path, selectedFile]);


  const deleteFromS3 = useCallback(async (directory, file) => {
    await awsConfig(directory);
    deleteFile(file.split('/').pop(), config)
      .then(async () => {
        await deleteSampleFile(dir['file_id']);
        setDeleted(true);
      })
      .catch();
  }, [awsConfig, config, dir]);

  const onInputBlur = async (e, key) => {
    if (key === 13) {
      oldName.current = newName;
      setNewName(e.target.value);
      e.target.blur();
      await renameFile(dir['file_id'], newName);
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
        url: dir['url'],
        name,
        time: studio.currentBeat,
        fade: {
          fadeIn: 0,
          fadeOut: 0,
        },
      };
      dispatch(addSampleAction(studio.selectedTrack, sampleState));
    },
    [dir, dispatch, selectedTrack, studio.currentBeat, studio.selectedTrack, studio.tracks.length],
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
            key={dir['file_id']}
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
  dir: PropTypes.object.isRequired,
  selectedFile: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  selectedTrack: PropTypes.number.isRequired,
};

const mapStateToProps = ({ studio }) => ({
  selectedTrack: studio.selectedTrack,
  selectedFile: studio.selectedFile,
  studio,
});

export default withRouter(connect(mapStateToProps)(File));
