import React, {
  useCallback, memo, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styles from './SampleControls.module.scss';
import {
  setSampleName, setSampleFadeIn, setSampleFadeOut, setSampleSynthPatch,
} from '../../actions/studioActions';
import Knob from '../Knob/Knob';

const SampleControls = memo((props) => {
  const {
    dispatch, studio,
  } = props;
  const { samples, selectedSample } = studio;

  let sample = useMemo(() => (
    samples[selectedSample]
  ), [samples, selectedSample]);

  sample = sample ? {
    synthControls: {
      envelope: {
        attack: 0.005,
        release: 1,
      },
    },
    ...sample,
  } : undefined;

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

  const handleAttack = useCallback((val) => {
    dispatch(setSampleSynthPatch(selectedSample, {
      ...sample.synthControls,
      envelope: {
        ...sample.synthControls.envelope,
        attack: val,
      },
    }));
  }, [dispatch, sample, selectedSample]);

  const handleRelease = useCallback((val) => {
    dispatch(setSampleSynthPatch(selectedSample, {
      ...sample.synthControls,
      envelope: {
        ...sample.synthControls.envelope,
        release: val,
      },
    }));
  }, [dispatch, sample, selectedSample]);

  const handleDecay = useCallback((val) => {
    dispatch(setSampleSynthPatch(selectedSample, {
      ...sample.synthControls,
      envelope: {
        ...sample.synthControls.envelope,
        decay: val,
      },
    }));
  }, [dispatch, sample, selectedSample]);

  const handleSustain = useCallback((val) => {
    dispatch(setSampleSynthPatch(selectedSample, {
      ...sample.synthControls,
      envelope: {
        ...sample.synthControls.envelope,
        sustain: val,
      },
    }));
  }, [dispatch, sample, selectedSample]);

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
            value={sample.name}
            onChange={handleChange}
          />
        </span>
        <div className={styles.buttons}>
          <Knob value={sample.fade.fadeIn} onChange={handleFadeIn} name="Fade in" />
          <Knob value={sample.fade.fadeOut} onChange={handleFadeOut} name="Fade out" />
          <Knob value={sample.synthControls.envelope.attack} onChange={handleAttack} name="Attack" sensitivity={3} />
          <Knob value={sample.synthControls.envelope.release} onChange={handleRelease} name="Release" sensitivity={3} />
          {sample.type === 'pattern' && !sample.url && (
            <>
              <Knob value={sample.synthControls.envelope.decay} onChange={handleDecay} name="Decay" sensitivity={3} />
              <Knob value={sample.synthControls.envelope.sustain} onChange={handleSustain} name="Sustain" sensitivity={3} />
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
