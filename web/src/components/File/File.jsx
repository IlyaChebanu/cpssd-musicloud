import React, {
  useState, useCallback, memo,
} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { deleteFile } from 'react-s3';
import { generatePresigned, deleteSampleFile, renameFile } from '../../helpers/api';
import { ReactComponent as SampleIcon } from '../../assets/icons/music_note-24px.svg';
import styles from './File.module.scss';
import { ReactComponent as Delete } from '../../assets/icons/delete_outline-24px.svg';

const File = memo((props) => {
  const {
    dir, level, dispatch,
  } = props;
  const [deleted, setDeleted] = useState(false);
  const [selectedFile, setSelectedFile] = useState(false);
  const { url } = dir;
  const urlArray = url.split('.');
  const extension = urlArray[urlArray.length - 1];
  const oldName = { current: dir.name };
  const [newName, setNewName] = useState(oldName.current);
  const pathDir = urlArray[3].split('/');
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

  const handleFileNameChange = useCallback(async (e) => {
    e.preventDefault();
    let name = e.target.value;
    dispatch(setSelectedFile(`${path}/${name}`));
    setNewName(e.target.value);
    if (!name) {
      name = 'Unnamed File';
    }
    await renameFile(dir.folder_id, name);
  }, [dir.folder_id, dispatch, path]);

  const selected = useCallback(() => {
    setSelectedFile(true);
  }, [setSelectedFile]);

  const deselected = useCallback(() => {
    setSelectedFile(false);
  }, [setSelectedFile]);

  const deleteFromS3 = useCallback(async (directory, file) => {
    await awsConfig(directory);
    await deleteFile(file.split('/').pop(), config)
      .then(async () => {
        await deleteSampleFile(dir.file_id);
        setDeleted(true);
      })
      .catch();
  }, [awsConfig, config, dir]);

  const onInputBlur = async (e) => {
    oldName.current = newName;
    setNewName(e.target.value);
    e.target.blur();
  };

  const togglePlayback = useCallback(async () => {
    const audio = document.getElementById(`file_id_${dir.file_id}_audio`);
    if (!audio.paused) {
      await audio.pause();
    } else {
      const allAudio = document.getElementsByTagName('audio');
      for (let i = 0; i < allAudio.length; i += 1) allAudio[i].pause();
      audio.currentTime = 0;
      await audio.play();
    }
  }, [dir.file_id]);

  return (
    <div>
      {!deleted
        ? (
          <li
            style={{ marginLeft: `${level * 25}px` }}
            onBlur={(e) => setSelectedFile(`${path}/${e.target.value}`)}
            onClick={async (e) => {
              e.preventDefault();
              togglePlayback();
            }}
            onMouseEnter={selected}
            onMouseLeave={deselected}
            className={selectedFile ? styles.selected : ''}
            key={`${dir.file_id}_file`}
          >
            <audio id={`file_id_${dir.file_id}_audio`} controls="controls" src={dir.url} style={{ display: 'none' }} />
            <SampleIcon style={{ paddingRight: '4px', fill: 'white' }} />
            <form onSubmit={(e) => { e.preventDefault(); }}>
              <input
                onBlur={(e) => { onInputBlur(e); }}
                onKeyDown={(e) => {
                  if (e.keyCode === 13) {
                    onInputBlur(e);
                  }
                  // Skip dot, comma, slash, backslash
                  if (e.keyCode === 190 || e.keyCode === 191
                     || e.keyCode === 188 || e.keyCode === 220) {
                    e.preventDefault();
                  }
                }}
                style={{ cursor: selectedFile ? 'pointer' : '' }}
                onChange={handleFileNameChange}
                value={newName}
                onClick={(e) => { if (selectedFile) { e.stopPropagation(); } }}
                disabled={!selectedFile}
              />
            </form>

            <Delete
              style={{ visibility: selectedFile ? 'visible' : 'hidden' }}
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
  dir: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  level: PropTypes.number.isRequired,
};

const mapStateToProps = () => ({});

export default withRouter(connect(mapStateToProps)(File));
