import React, {
  useCallback, memo, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styles from './SampleControls.module.scss';
import {
  setSampleName,
} from '../../actions/studioActions';
import { ReactComponent as Knob } from '../../assets/icons/Knob.svg';

const SampleControls = memo((props) => {
  const {
    dispatch, studio, tracks,
  } = props;

  const [nameInput, setNameInput] = useState(studio.selectedSample);

  const handleSetSampleName = useCallback(async () => {
    dispatch(setSampleName(nameInput));
    setNameInput(nameInput);
  }, [dispatch, nameInput]);

  useEffect(() => {
    if (studio.tracks === undefined) {
      return;
    }
    const track = studio.tracks[studio.selectedTrack];
    if (track === undefined) {
      return;
    }
    if (studio.selectedTrack !== -1 && studio.selectedSample !== -1) {
      const sample = track.samples.filter((s) => s.id === studio.selectedSample)[0];
      if (sample === undefined) {
        return;
      }
      setNameInput(sample.name);
    }
  }, [studio.sampleName, studio.selectedSample, studio.selectedTrack, studio.tracks, tracks]);


  const handleChange = useCallback((e) => {
    setNameInput(e.target.value);
  }, []);


  return (
    <div
      style={{
        bottom: studio.sampleEffectsHidden ? '0px' : '60px',
        visibility: studio.sampleEffectsHidden ? 'hidden' : 'visible',
      }}
      className={styles.footer}
    >
      <span>
        <span className={styles.sampleName}>
          <input
            value={nameInput}
            onBlur={handleSetSampleName}
            onChange={handleChange}
          />
        </span>
        <div className={styles.buttons}>
          <span>
            <Knob />
            <p>Fade in</p>
          </span>
          <span>
            <Knob />
            <p>Fade out</p>
          </span>
          <span>
            <Knob />
            <p>Reverb</p>
          </span>
          <span>
            <Knob />
            <p>Delay</p>
          </span>
        </div>
      </span>
    </div>
  );
});


SampleControls.propTypes = {
  dispatch: PropTypes.func.isRequired,
  studio: PropTypes.object.isRequired,
  selectedSample: PropTypes.string.isRequired,
  tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
};

SampleControls.displayName = 'SampleControls';

const mapStateToProps = ({ studio }) => ({ studio });

export default withRouter(connect(mapStateToProps)(SampleControls));
