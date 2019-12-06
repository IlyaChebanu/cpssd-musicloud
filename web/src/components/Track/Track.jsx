/* eslint-disable react/no-array-index-key */
import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { HotKeys, configure } from 'react-hotkeys';
import styles from './Track.module.scss';
import { genId } from '../../helpers/utils';
import Sample from '../Sample/Sample';
import { setSelectedTrack, setTrackAtIndex } from '../../actions/studioActions';

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
    index, dispatch, clipboard, track, tempo, className, gridSize, gridWidth,
  } = props;

  const getSample = useCallback((sample) => (
    <Sample
      sample={{ ...sample, track: index }}
      style={{
        position: 'absolute',
        transform: `translateX(${(sample.time - 1) * (40 * gridSize)}px)`,
      }}
      key={sample.id}
    />
  ), [gridSize, index]);

  const samples = useMemo(() => (
    track.samples && track.samples.map(getSample)
  ), [getSample, track.samples]);

  const handleSetSelected = useCallback(() => {
    dispatch(setSelectedTrack(index));
  }, [dispatch, index]);

  const pasteSample = useCallback(() => {
    const sample = { ...clipboard };
    if (_.isEmpty(sample)) {
      return;
    }
    const lastSample = track.samples[track.samples.length - 1];
    sample.id = genId();
    sample.time = lastSample ? lastSample.time + (lastSample.duration * 60) / tempo : 1;
    track.samples.push(sample);
    dispatch(setTrackAtIndex(track, index));
  }, [clipboard, dispatch, index, tempo, track]);

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
      {samples}
    </HotKeys>
  );
});

Track.propTypes = {
  index: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
  track: PropTypes.object.isRequired,
  clipboard: PropTypes.object.isRequired,
  tempo: PropTypes.number.isRequired,
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
  tempo: studio.tempo,
  test: studio.test,
  gridSize: studio.gridSize,
  gridWidth: studio.gridWidth,
});

export default connect(mapStateToProps)(Track);
