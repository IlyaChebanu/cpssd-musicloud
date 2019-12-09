import React, {
  memo, useCallback, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Img from 'react-image';
import styles from './PublishForm.module.scss';
import closeIcon from '../../assets/icons/close-24px.svg';
import {
  setSongName, setSongImageUrl, hidePublishForm,
} from '../../actions/studioActions';
import { showNotification } from '../../actions/notificationsActions';
import CloudQuestion from '../../assets/cloud-question.jpg';
import {
  uploadFile, publishSong, addSongCoverArt, patchSongName, patchSongDescription,
} from '../../helpers/api';
import Spinner from '../Spinner/Spinner';
import SubmitButton from '../SubmitButton/SubmitButton';

const PublishForm = memo((props) => {
  const {
    studio, dispatch,
  } = props;
  const { publishFormHidden, songImageUrl } = studio;
  const [nameInput, setNameInput] = useState(studio.songName);
  const [description, setDescription] = useState(studio.songDescription);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (nameInput !== studio.songName) {
      setNameInput(studio.songName);
    }
    if (description !== studio.songDescription) {
      setDescription(studio.songDescription);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studio.songName, studio.songDescription]);

  const handleNameChange = useCallback((e) => {
    setNameInput(e.target.value);
    dispatch(setSongName(e.target.value));
  }, [dispatch]);

  const handleDescriptionChange = useCallback((e) => {
    setDescription(e.target.value);
  }, []);

  const handleSetName = useCallback(async () => {
    dispatch(setSongName(nameInput));
    setNameInput(nameInput);
  }, [dispatch, nameInput]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSetName();
    }
  }, [handleSetName]);

  const uploadCoverToS3 = useCallback(async (img) => {
    setLoading(true);
    const res = await uploadFile('cover', img, studio.songId);
    dispatch(setSongImageUrl(res));
    setLoading(false);
  }, [dispatch, studio.songId]);


  const handlePublishSong = useCallback(async (e) => {
    e.preventDefault();
    if (songImageUrl) {
      await addSongCoverArt({
        url: studio.songImageUrl,
        sid: studio.songId,
      });
    }
    dispatch(hidePublishForm());
    await publishSong(studio.songId);
    await patchSongName(studio.songId, nameInput);
    await patchSongDescription(studio.songId, description);
    dispatch(showNotification({ message: 'Song successfully published!', type: 'info' }));
  }, [description, dispatch, nameInput, songImageUrl, studio.songId, studio.songImageUrl]);

  const handleCoverChange = useCallback(async () => {
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('accept', 'image/*');
    fileSelector.click();
    fileSelector.onchange = function onChange() {
      const img = fileSelector.files[0];
      uploadCoverToS3(img);
    };
  }, [uploadCoverToS3]);

  return (
    <div style={{ visibility: publishFormHidden ? 'hidden' : 'visible' }} className={styles.wrapper}>

      <img
        onClick={() => dispatch(hidePublishForm())}
        style={{ fill: 'white' }}
        className={styles.closePublish}
        src={closeIcon}
        alt="Close publish view"
      />
      <div className={styles.formWrapper}>

        <div className={styles.imgBlock}>
          {loading ? <Spinner className={styles.spinner} /> : (
            <Img
              onClick={handleCoverChange}
              className={styles.img}
              alt="Song cover"
              src={studio.songImageUrl ? studio.songImageUrl : CloudQuestion}
            />
          )}
          <p>Change cover</p>
        </div>
        <div className={styles.inputWrapper}>
          <p>Song name</p>
          <input
            value={nameInput}
            className={styles.input}
            onChange={handleNameChange}
            onBlur={handleSetName}
            onKeyDown={handleKeyDown}
          />
          <p>Song description</p>
          <input
            value={description}
            onChange={handleDescriptionChange}
            className={styles.input}
            placeholder="Describe your song"
          />
        </div>
      </div>
      <form
        onSubmit={handlePublishSong}
      >
        <SubmitButton
          text="Publish"
          className={styles.publishButton}
        />
      </form>
    </div>
  );
});

PublishForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  studio: PropTypes.object.isRequired,
};

PublishForm.displayName = 'PublishForm';

const mapStateToProps = ({ studio }) => ({
  studio,
});

export default connect(mapStateToProps)(PublishForm);
