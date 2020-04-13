import React, {
  useCallback, memo, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import styles from './SampleControls.module.scss';
import {
  setSampleName, setSampleFadeIn, setSampleFadeOut, setSamplePatch,
} from '../../actions/studioActions';
import Knob from '../Knob';
import Button from '../Button';

const SampleControls = memo((props) => {
  const {
    dispatch, studio,
  } = props;
  const { samples, selectedSample } = studio;

  const ref = useRef();
  const [inputSelected, setInputSelected] = useState(false);

  const sample = useMemo(() => {
    const s = samples[selectedSample];
    if (s && !s.patch) {
      s.patch = {
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.3,
          release: 0.3,
        },
        oscillator: {
          type: 'triangle',
        },
      };
    }
    return s;
  }, [samples, selectedSample]);

  const handleChange = useCallback((e) => {
    dispatch(setSampleName(selectedSample, e.target.value));
  }, [dispatch, selectedSample]);

  const handleFadeIn = useCallback((val) => {
    dispatch(setSampleFadeIn(selectedSample, val));
    if (val + sample.fade.fadeOut > 1) {
      dispatch(setSampleFadeOut(selectedSample, 1 - val));
    }
  }, [dispatch, sample, selectedSample]);

  const handleFadeOut = useCallback((val) => {
    dispatch(setSampleFadeOut(selectedSample, val));
    if (val + sample.fade.fadeIn > 1) {
      dispatch(setSampleFadeIn(selectedSample, 1 - val));
    }
  }, [dispatch, sample, selectedSample]);

  const handleSetEnvelopeProperty = useCallback((prop) => (val) => {
    dispatch(setSamplePatch(selectedSample, {
      ...sample.patch,
      envelope: {
        ...sample.patch.envelope,
        [prop]: val,
      },
    }));
  }, [dispatch, sample, selectedSample]);

  const handleSetWaveType = useCallback((e) => {
    dispatch(setSamplePatch(selectedSample, {
      ...sample.patch,
      oscillator: {
        ...sample.patch.oscillator,
        type: e.target.value,
      },
    }));
  }, [dispatch, sample, selectedSample]);

  const handleSavePatch = useCallback(() => {

  }, []);

  if (!sample) {
    return null;
  }
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
            ref={(r) => { ref.current = r; }}
            data-tip={!inputSelected ? 'Change sample name' : ''}
            data-for="tooltip"
            data-place="right"
            value={sample.name}
            onClick={() => {
              setInputSelected(true);
              ReactTooltip.hide(ref.current);
            }}
            onMouseMove={() => {
              if (inputSelected) {
                ReactTooltip.hide(ref.current);
              }
            }}
            onBlur={() => setInputSelected(false)}
            onChange={handleChange}
          />

        </span>
        <div className={styles.buttons}>
          <Knob dataTip="Hold and move up or down to gradually increase sound from silence at the beginning" value={sample.fade.fadeIn} onChange={handleFadeIn} name="Fade in" />
          <Knob dataTip="Hold and move up or down to gradually reduce sound to silence at its end" value={sample.fade.fadeOut} onChange={handleFadeOut} name="Fade out" />
          {!sample.url && (
            <>
              <Knob
                dataTip="Time taken for the initial ramp up of note volume"
                value={sample.patch.envelope.attack}
                onChange={handleSetEnvelopeProperty('attack')}
                name="Attack"
              />
              <Knob
                dataTip="Time taken for ramp down to sustain value"
                value={sample.patch.envelope.decay}
                onChange={handleSetEnvelopeProperty('decay')}
                name="Decay"
              />
              <Knob
                dataTip="Volume level after decay until note stops"
                value={sample.patch.envelope.sustain}
                onChange={handleSetEnvelopeProperty('sustain')}
                name="Sustain"
              />
              <Knob
                dataTip="Time taken for the level to ramp down to 0 after note release"
                value={sample.patch.envelope.release}
                onChange={handleSetEnvelopeProperty('release')}
                name="Release"
              />
              <select onChange={handleSetWaveType} className={styles.wave}>
                <option value="triangle" selected={sample.patch.oscillator.type === 'triangle'}>Triangle wave</option>
                <option value="sawtooth" selected={sample.patch.oscillator.type === 'sawtooth'}>Sawtooth wave</option>
                <option value="square" selected={sample.patch.oscillator.type === 'square'}>Square wave</option>
                <option value="sine" selected={sample.patch.oscillator.type === 'sine'}>Sine wave</option>
              </select>
              <Button className={styles.saveBtn} onClick={handleSavePatch}>Save patch</Button>
            </>
          )}
        </div>
      </span>
    </div>
  );
});


SampleControls.propTypes = {
  dispatch: PropTypes.func.isRequired,
  studio: PropTypes.object.isRequired,
  selectedSample: PropTypes.string,
};

SampleControls.defaultProps = {
  selectedSample: '',
};

SampleControls.displayName = 'SampleControls';

const mapStateToProps = ({ studio }) => ({ studio });

export default withRouter(connect(mapStateToProps)(SampleControls));
