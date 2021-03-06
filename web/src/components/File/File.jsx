/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, {
  useState, useCallback, memo, useRef, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { deleteFile } from 'react-s3';
import { useDragEvents } from 'beautiful-react-hooks';
import ReactTooltip from 'react-tooltip';
import { shadeColor } from '../../helpers/utils';
import { generatePresigned, deleteSampleFile, renameFile } from '../../helpers/api';
import { ReactComponent as SampleIcon } from '../../assets/icons/music_note-24px.svg';
import styles from './File.module.scss';
import { ReactComponent as Delete } from '../../assets/icons/delete_outline-24px.svg';
import { setFileMoved } from '../../actions/studioActions';

const File = memo((props) => {
  const {
    dir, level, dispatch, getParentContents, fileMoved,
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
  const ref = useRef();
  const inputRef = useRef();
  const { onDragOver, onDrop } = useDragEvents(inputRef, false);
  useDragEvents(ref, false);
  const { onDragStart, onDragEnd } = useDragEvents(ref);
  onDragStart((event) => {
    event.dataTransfer.setData('id', dir.file_id);
    event.dataTransfer.setData('type', 'file');
    event.dataTransfer.setData('url', url);
    event.dataTransfer.setData('name', newName);
  });

  useEffect(() => {
    if (fileMoved === dir.file_id) {
      getParentContents();
    }
  }, [dir.file_id, fileMoved, getParentContents]);

  onDragEnd((event) => {
    event.preventDefault();
    dispatch(setFileMoved(-1));
  });

  onDragOver((e) => {
    e.preventDefault();
  });

  onDrop((e) => {
    e.preventDefault();
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
    setSelectedFile(`${path}/${name}`);
    setNewName(e.target.value);
    if (!name) {
      name = 'Unnamed File';
    }
    await renameFile(dir.file_id, name);
  }, [dir.file_id, path]);

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
            id={dir.file_id}
            type="file"
            ref={ref}
            style={{ backgroundColor: !selectedFile ? shadeColor('#414448', +20 * level) : '' }}
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

            <SampleIcon
              data-tip="Click to play, hold and drag to rearrange or add to track"
              data-for="tooltip"
              data-place="left"
              onBlur={ReactTooltip.hide}
              onMouseOver={ReactTooltip.rebuild}
              style={{ paddingRight: '4px', fill: 'white' }}
            />
            <form onSubmit={(e) => { e.preventDefault(); }}>
              <input
                ref={inputRef}

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
  getParentContents: PropTypes.func.isRequired,
  fileMoved: PropTypes.number.isRequired,
};

const mapStateToProps = ({ studio }) => ({
  fileMoved: studio.fileMoved,
});

export default withRouter(connect(mapStateToProps)(File));
