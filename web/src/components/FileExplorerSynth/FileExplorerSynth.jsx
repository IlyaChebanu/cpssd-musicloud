/* eslint-disable consistent-return */
import React, { useState, useCallback } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './FileExplorerSynth.module.scss';
import { showNotification } from '../../actions/notificationsActions';
import { addSample, setSamplePatchId, setSamplePatch } from '../../actions/studioActions';
import { deleteSynth, changeSynthName } from '../../helpers/api';

import { ReactComponent as DeleteIcon } from '../../assets/icons/delete_outline-24px.svg';
import { ReactComponent as SynthIcon } from '../../assets/icons/waveform-path-light.svg';
import { useEffectAfterMount } from '../../helpers/hooks';

const FileExplorerSynth = ({
  synth, studio, dispatch, onDelete,
}) => {
  const [synthName, setSynthName] = useState(synth.name);

  useEffectAfterMount(() => {
    changeSynthName(synth.id, synthName);
  }, [synth.id, synthName]);

  const handleSynthClick = useCallback((e) => {
    e.preventDefault();
    if (!studio.selectedSample) {
      if (!studio.selectedTrack) {
        return dispatch(showNotification({
          message: 'Please selecte a track first',
          type: 'info',
        }));
      }
      return dispatch(addSample(
        studio.selectedTrack,
        {
          name: synth.name,
          time: studio.currentBeat,
          fade: {
            fadeIn: 0,
            fadeOut: 0,
          },
          type: 'pattern',
          duration: 0,
          notes: [],
          patch: synth.patch,
          patchId: synth.id,
        },
      ));
    }
    dispatch(setSamplePatchId(studio.selectedSample, synth.id));
    dispatch(setSamplePatch(studio.selectedSample, synth.patch));
  }, [
    dispatch,
    studio.currentBeat,
    studio.selectedSample,
    studio.selectedTrack,
    synth.id,
    synth.name,
    synth.patch,
  ]);

  const handleDeleteSynth = useCallback(async (e) => {
    e.preventDefault();
    await deleteSynth(synth.id);
    onDelete();
  }, [onDelete, synth.id]);

  const handleUpdateSynthName = useCallback((e) => {
    e.preventDefault();
    setSynthName(e.target.value);
  }, []);

  return (
    <li key={synth.id} className={styles.synth}>
      <span>
        <SynthIcon onClick={handleSynthClick} className={styles.synthIcon} />
        <input type="text" value={synthName} onChange={handleUpdateSynthName} />
      </span>
      <DeleteIcon className={styles.delete} onClick={handleDeleteSynth} />
    </li>
  );
};

FileExplorerSynth.propTypes = {
  synth: PropTypes.object.isRequired,
  studio: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const mapStateToProps = ({ studio }) => ({ studio });

export default connect(mapStateToProps)(FileExplorerSynth);
