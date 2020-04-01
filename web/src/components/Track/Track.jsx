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
} from '../../actions/studioActions';

configure({
  allowCombinationSubmatches: true,
});

const Ticks = memo(({ gridSize, gridWidth }) => {
  const ticks = useMemo(() => (
    [...Array(Math.ceil(gridWidth * gridSize))]
      .map((__, i) => <rect key={i} x={i * 40} className={styles.tick} />)
  ), [gridSize, gridWidth]);
  return (
    <svg className={styles.gridLines} style={{ width: Math.ceil(gridWidth * gridSize) * 40 }}>
      {ticks}
    </svg>
  );
});

Ticks.propTypes = {
  gridSize: PropTypes.number.isRequired,
  gridWidth: PropTypes.number.isRequired,
};

Ticks.displayName = 'Ticks';

const Track = memo((props) => {
  const {
    dispatch, clipboard, track, className, gridSize, gridWidth, index,
  } = props;

  const handleSetSelected = useCallback(() => {
    dispatch(setSelectedTrack(track.id));
    dispatch(setSelectedSample(''));
    dispatch(hideSampleEffects());
    dispatch(setShowPianoRoll(false));
  }, [dispatch, track.id]);

  const pasteSample = useCallback(() => {
    const sample = { ...clipboard };
    if (_.isEmpty(sample)) {
      return;
    }
    sample.time += sample.duration;
    dispatch(addSample(track.id, sample));
  }, [clipboard, dispatch, track.id]);

  const keyMap = {
    PASTE_SAMPLE: 'ctrl+v',
  };

  const handlers = {
    PASTE_SAMPLE: pasteSample,
  };

  const widthStyle = useMemo(() => ({
    width: Math.ceil(gridWidth * gridSize) * 40,
  }), [gridSize, gridWidth]);

  return (
    <HotKeys
      allowChanges
      keyMap={keyMap}
      handlers={handlers}
      className={`${styles.wrapper} ${index % 2 ? styles.even : ''} ${className}`}
      onMouseDown={handleSetSelected}
      style={widthStyle}
    >
      <Ticks gridSize={gridSize} gridWidth={gridWidth} />
    </HotKeys>
  );
});

Track.propTypes = {
  index: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
  track: PropTypes.object.isRequired,
  clipboard: PropTypes.object.isRequired,
  className: PropTypes.string,
  gridSize: PropTypes.number.isRequired,
  gridWidth: PropTypes.number.isRequired,
};

Track.defaultProps = {
  className: '',
};

Track.displayName = 'Track';

const mapStateToProps = ({ studio }) => ({
  tracks: studio.tracks,
  scroll: studio.scroll,
  selectedTrack: studio.selectedTrack,
  clipboard: studio.clipboard,
  test: studio.test,
  gridSize: studio.gridSize,
  gridWidth: studio.gridWidth,
});

export default connect(mapStateToProps)(Track);
