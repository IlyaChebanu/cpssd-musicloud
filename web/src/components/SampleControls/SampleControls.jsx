import React, {
  useCallback, memo, useState, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import styles from './SampleControls.module.scss';
import {
  setSampleName, setSampleFade, setSampleReverb,
} from '../../actions/studioActions';
import { ReactComponent as Knob } from '../../assets/icons/Knob.svg';
import { clamp, lerp } from '../../helpers/utils';

const SampleControls = memo((props) => {
  const {
    dispatch, studio,
  } = props;

  const [nameInput, setNameInput] = useState(studio.selectedSample);

  const track = useMemo(() => (
    studio.tracks[studio.selectedTrack]
  ), [studio.selectedTrack, studio.tracks]);

  const sample = (
    track && _.find(track.samples, (s) => s.id === studio.selectedSample)
  ) || { fade: {}, reverb: {} };

  const handleSetSampleName = useCallback(async () => {
    dispatch(setSampleName(nameInput));
    setNameInput(nameInput);
  }, [dispatch, nameInput]);

  useEffect(() => {
    if (studio.tracks === undefined) {
      return;
    }
    if (!track) {
      return;
    }
    if (studio.selectedTrack !== -1 && studio.selectedSample !== -1) {
      if (!sample) {
        return;
      }
      setNameInput(sample.name);
    }
  }, [sample, studio.selectedSample, studio.selectedTrack, studio.tracks, track]);


  const handleChange = useCallback((e) => {
    setNameInput(e.target.value);
    dispatch(setSampleName(e.target.value, studio.selectedSample));
  }, [dispatch, studio.selectedSample]);

  const handleFadeIn = useCallback((ev) => {
    ev.preventDefault();
    const startPos = ev.screenY;
    const startVal = (sample.fade && sample.fade.fadeIn) || 0;
    let lastVal = startVal;
    const handleMouseMove = (e) => {
      const pos = e.screenY;
      const val = clamp(0, 1, startVal - (pos - startPos) / 200);
      if (val !== lastVal) {
        lastVal = val;
        if (val + sample.fade.fadeOut > 1) {
          sample.fade.fadeOut = 1 - val;
        }
        dispatch(setSampleFade(sample.id, { ...sample.fade, fadeIn: val }));
      }
    };
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [dispatch, sample.fade, sample.id]);

  const fadeInStyle = useMemo(() => ({
    transform: `rotate(${lerp(-140, 140, sample.fade.fadeIn || 0)}deg)`,
  }), [sample.fade]);

  const handleFadeOut = useCallback((ev) => {
    ev.preventDefault();
    const startPos = ev.screenY;
    const startVal = (sample.fade && sample.fade.fadeOut) || 0;
    let lastVal = startVal;
    const handleMouseMove = (e) => {
      const pos = e.screenY;
      const val = clamp(0, 1, startVal - (pos - startPos) / 200);
      if (val !== lastVal) {
        lastVal = val;
        if (val + sample.fade.fadeIn > 1) {
          sample.fade.fadeIn = 1 - val;
        }
        dispatch(setSampleFade(sample.id, { ...sample.fade, fadeOut: val }));
      }
    };
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [dispatch, sample.fade, sample.id]);

  const fadeOutStyle = useMemo(() => ({
    transform: `rotate(${lerp(-140, 140, sample.fade.fadeOut || 0)}deg)`,
  }), [sample.fade]);

  const handleReverbDry = useCallback((ev) => {
    ev.preventDefault();
    const startPos = ev.screenY;
    const startVal = (sample.reverb && sample.reverb.dry) || 0;
    let lastVal = startVal;
    const handleMouseMove = (e) => {
      const pos = e.screenY;
      const val = clamp(0, 1, startVal - (pos - startPos) / 200);
      if (val !== lastVal) {
        lastVal = val;
        dispatch(setSampleReverb(sample.id, { ...sample.reverb, dry: val }));
      }
    };
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [dispatch, sample.id, sample.reverb]);

  const reverbDryStyle = useMemo(() => ({
    transform: `rotate(${lerp(-140, 140, sample.reverb.dry || 0)}deg)`,
  }), [sample.reverb]);

  const handleReverbWet = useCallback((ev) => {
    ev.preventDefault();
    const startPos = ev.screenY;
    const startVal = (sample.reverb && sample.reverb.wet) || 0;
    let lastVal = startVal;
    const handleMouseMove = (e) => {
      const pos = e.screenY;
      const val = clamp(0, 1, startVal - (pos - startPos) / 200);
      if (val !== lastVal) {
        lastVal = val;
        dispatch(setSampleReverb(sample.id, { ...sample.reverb, wet: val }));
      }
    };
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [dispatch, sample.id, sample.reverb]);

  const reverbWetStyle = useMemo(() => ({
    transform: `rotate(${lerp(-140, 140, sample.reverb.wet || 0)}deg)`,
  }), [sample.reverb]);

  const handleReverbCutoff = useCallback((ev) => {
    ev.preventDefault();
    const startPos = ev.screenY;
    const startVal = (sample.reverb && sample.reverb.cutoff) || 0;
    let lastVal = startVal;
    const handleMouseMove = (e) => {
      const pos = e.screenY;
      const val = clamp(0, 1, startVal - (pos - startPos) / 200);
      if (val !== lastVal) {
        lastVal = val;
        dispatch(setSampleReverb(sample.id, { ...sample.reverb, cutoff: val }));
      }
    };
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [dispatch, sample.id, sample.reverb]);

  const reverbCutoffStyle = useMemo(() => ({
    transform: `rotate(${lerp(-140, 140, sample.reverb.cutoff || 0)}deg)`,
  }), [sample.reverb]);

  const handleReverbTime = useCallback((ev) => {
    ev.preventDefault();
    const startPos = ev.screenY;
    const startVal = (sample.reverb && sample.reverb.time) || 0;
    let lastVal = startVal;
    const handleMouseMove = (e) => {
      const pos = e.screenY;
      const val = clamp(0, 1, startVal - (pos - startPos) / 200);
      if (val !== lastVal) {
        lastVal = val;
        dispatch(setSampleReverb(sample.id, { ...sample.reverb, time: val }));
      }
    };
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [dispatch, sample.id, sample.reverb]);

  const reverbTimeStyle = useMemo(() => ({
    transform: `rotate(${lerp(-140, 140, sample.reverb.time || 0)}deg)`,
  }), [sample.reverb]);

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
            <Knob onMouseDown={handleFadeIn} style={fadeInStyle} />
            <p>Fade in</p>
          </span>
          <span>
            <Knob onMouseDown={handleFadeOut} style={fadeOutStyle} />
            <p>Fade out</p>
          </span>
          <span>
            <Knob onMouseDown={handleReverbWet} style={reverbWetStyle} />
            <p>Reverb wet</p>
          </span>
          <span>
            <Knob onMouseDown={handleReverbDry} style={reverbDryStyle} />
            <p>Reverb dry</p>
          </span>
          <span>
            <Knob onMouseDown={handleReverbCutoff} style={reverbCutoffStyle} />
            <p>Reverb cut-off</p>
          </span>
          <span>
            <Knob onMouseDown={handleReverbTime} style={reverbTimeStyle} />
            <p>Reverb time</p>
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
