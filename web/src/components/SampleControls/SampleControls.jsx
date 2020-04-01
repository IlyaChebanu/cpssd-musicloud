import React, {
  useCallback, memo, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styles from './SampleControls.module.scss';
import {
  setSampleName, setSampleFadeIn, setSampleFadeOut,
} from '../../actions/studioActions';
import Knob from '../Knob/Knob';

const SampleControls = memo((props) => {
  const {
    dispatch, studio,
  } = props;
  const { samples, selectedSample } = studio;

  const sample = useMemo(() => (
    samples[selectedSample]
  ), [samples, selectedSample]);

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
