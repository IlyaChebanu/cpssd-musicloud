/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/button-has-type */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';

import styles from './EffectsWindow.module.scss';
import Knob from '../Knob/Knob';
import { setTrackEffects, hideEffectsWindow } from '../../actions/studioActions';
import Button from '../Button/Button';

// For more effects visit https://tonejs.github.io/docs/13.8.25/Distortion
const effects = {
  Distortion: {
    distortion: {
      isSignal: false,
      isContinuous: true,
      range: [0, 1],
      value: 0.4,
    },
    oversample: {
      isSignal: false,
      isContinuous: false,
      values: [
        'none',
        '2x',
        '4x',
      ],
      value: 'none',
    },
    wet: {
      isSignal: true,
      isContinuous: true,
      range: [0, 1],
      value: 1,
    },
  },
  JCReverb: {
    roomSize: {
      isSignal: true,
      isContinuous: true,
      range: [0, 1],
      value: 0.5,
    },
    wet: {
      isSignal: true,
      isContinuous: true,
      range: [0, 1],
      value: 1,
    },
  },
};

const EffectsWindow = ({
  dispatch, tracks, selectedTrack, showEffectsWindow,
}) => {
  if (!selectedTrack || !showEffectsWindow) return null;
  const track = _.find(tracks, (t) => t.id === selectedTrack);
  const disabledEffects = Object.keys(effects).filter((effectName) => !track.effects[effectName]);

  const handleEnableEffect = (effectName) => () => {
    const newEffectsObject = {
      ...track.effects,
      [effectName]: { ...effects[effectName] },
    };
    dispatch(setTrackEffects(track.id, newEffectsObject));
  };

  const handleDisableEffect = (effectName) => () => {
    const newEffectsObject = { ...track.effects };
    delete newEffectsObject[effectName];

    dispatch(setTrackEffects(track.id, newEffectsObject));
  };

  const handleHideWindow = () => {
    dispatch(hideEffectsWindow());
  };

  const handleSetEffectValue = (effectName, parameterName) => (e) => {
    const value = e.target ? e.target.value : e;

    const newEffectsObject = {
      ...track.effects,
      [effectName]: {
        ...track.effects[effectName],
        [parameterName]: {
          ...track.effects[effectName][parameterName],
          value,
        },
      },
    };
    dispatch(setTrackEffects(track.id, newEffectsObject));
  };
  return (
    <div className={styles.overlay}>
      <div className={styles.clickCatcher} onClick={handleHideWindow} />
      <div className={styles.window}>
        <div className={styles.header}>
          <span className={styles.title}>{`Effects for track: ${track.name}`}</span>
        </div>
        {track.effects && Object.entries(track.effects).map(([effectName, parameters]) => (
          <div className={styles.row}>
            <span className={styles.effectName}>{effectName}</span>
            {Object.entries(parameters).map(([parameterName, values]) => {
              if (values.isContinuous) {
                return (
                  <Knob
                    name={parameterName}
                    value={values.value}
                    className={styles.knob}
                    dataTip="Hold and move up or down to change effect value"
                    onChange={handleSetEffectValue(effectName, parameterName)}
                    min={values.range[0]}
                    max={values.range[1]}
                  />
                );
              }
              return (
                <div className={styles.selectWrapper}>
                  <select>
                    {values.values.map((optionName) => (
                      <option
                        value={optionName}
                        selected={values.value === optionName}
                      >
                        {optionName}
                      </option>
                    ))}
                  </select>
                  <span>{parameterName}</span>
                </div>
              );
            })}
          </div>
        ))}
        <div className={styles.footer}>
          {disabledEffects.map((effectName) => (
            <Button onClick={handleEnableEffect(effectName)}>
              {`Enable ${effectName}`}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

EffectsWindow.propTypes = {
  dispatch: PropTypes.func.isRequired,
  tracks: PropTypes.array.isRequired,
  selectedTrack: PropTypes.any.isRequired,
  showEffectsWindow: PropTypes.bool.isRequired,
};

const mapStateToProps = ({ studio, studioUndoable }) => ({
  tracks: studioUndoable.present.tracks,
  selectedTrack: studio.selectedTrack,
  showEffectsWindow: studio.showEffectsWindow,
});

export default connect(mapStateToProps)(EffectsWindow);
