/* eslint-disable react/no-array-index-key */
import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { HotKeys, configure } from 'react-hotkeys';
import styles from './Track.module.scss';
import {
  setSelectedTrack,
  setSelectedSample,
  hideSampleEffects,
  setShowPianoRoll,
  addSample,
  resetSampleSelection,
} from '../../actions/studioActions';

configure({
  allowCombinationSubmatches: true,
});

const Ticks = memo(({ gridSize, gridWidth, gridUnitWidth }) => {
  const ticks = useMemo(() => (
    [...Array(Math.ceil(gridWidth * gridSize))]
      .map((__, i) => <rect key={i} x={i * gridUnitWidth} className={styles.tick} />)
  ), [gridSize, gridWidth, gridUnitWidth]);
  return (
    <svg
      className={styles.gridLines}
      style={{
        width: Math.ceil(gridWidth * gridSize)
    * gridUnitWidth,
      }}
    >
      {ticks}
    </svg>
  );
});

Ticks.propTypes = {
  gridSize: PropTypes.number.isRequired,
  gridWidth: PropTypes.number.isRequired,
  gridUnitWidth: PropTypes.number.isRequired,
};

Ticks.displayName = 'Ticks';

const Track = memo((props) => {
  const {
    dispatch, clipboard, track, className, gridSize, gridWidth, gridUnitWidth, index, samples,
  } = props;

  const handleSetSelected = useCallback(() => {
    dispatch(setSelectedTrack(track.id));
    dispatch(setSelectedSample(''));
    dispatch(resetSampleSelection());
    dispatch(hideSampleEffects());
    dispatch(setShowPianoRoll(false));
  }, [dispatch, track.id]);

  const keyMap = {
    PASTE_SAMPLE: 'ctrl+v',
  };

  const handlers = {
    PASTE_SAMPLE: () => {
      if (!clipboard.length) {
        return;
      }

      const tracksInClipboard = [...new Set(clipboard.map((s) => s.trackId))];

      const trackSamples = Object.values(samples).filter(
        (s) => tracksInClipboard.includes(s.trackId),
      );
      const latestInTrack = _.maxBy(trackSamples, (o) => o.time + o.duration);
      const earliestInClipboard = _.minBy(clipboard, (s) => s.time);

      clipboard.forEach((clipSample) => {
        const newSample = { ...clipSample };

        newSample.time += (latestInTrack.time + latestInTrack.duration - earliestInClipboard.time);
        dispatch(addSample(newSample.trackId, newSample));
      });
    },
  };

  const widthStyle = useMemo(() => ({
    width: Math.ceil(gridWidth * gridSize) * gridUnitWidth,
  }), [gridSize, gridUnitWidth, gridWidth]);

  return (
    <HotKeys
      allowChanges
      keyMap={keyMap}
      handlers={handlers}
      className={`${styles.wrapper} ${index % 2 ? styles.even : ''} ${className}`}
      onMouseDown={handleSetSelected}
      style={widthStyle}
    >
      <Ticks gridSize={gridSize} gridWidth={gridWidth} gridUnitWidth={gridUnitWidth} />
    </HotKeys>
  );
});

Track.propTypes = {
  index: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
  track: PropTypes.object.isRequired,
  clipboard: PropTypes.array.isRequired,
  className: PropTypes.string,
  gridSize: PropTypes.number.isRequired,
  gridWidth: PropTypes.number.isRequired,
  gridUnitWidth: PropTypes.number.isRequired,
  samples: PropTypes.object.isRequired,
};

Track.defaultProps = {
  className: '',
};

Track.displayName = 'Track';

const mapStateToProps = ({ studio, studioUndoable }) => ({
  scroll: studio.scroll,
  selectedTrack: studio.selectedTrack,
  clipboard: studio.clipboard,
  test: studio.test,
  gridSize: studio.gridSize,
  gridWidth: studio.gridWidth,
  gridUnitWidth: studio.gridUnitWidth,
  samples: studioUndoable.present.samples,
});

export default connect(mapStateToProps)(Track);
