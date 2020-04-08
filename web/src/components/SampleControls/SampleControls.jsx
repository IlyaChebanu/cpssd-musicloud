import React, {
  useCallback, memo, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
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

  const ref = useRef();
  const [inputSelected, setInputSelected] = useState(false);

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
            ref={(r) => { ref.current = r; }}
            data-tip={!inputSelected ? 'Change sample name' : ''}
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
          <Knob dataTip="Hold and move up or down to radually reduce sound to silence at its end" value={sample.fade.fadeOut} onChange={handleFadeOut} name="Fade out" />
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
