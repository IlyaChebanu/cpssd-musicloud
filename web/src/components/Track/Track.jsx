/* eslint-disable react/no-array-index-key */
import React, {
  memo, useCallback, useMemo, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { HotKeys, configure } from 'react-hotkeys';
import { useDragEvents } from 'beautiful-react-hooks';
import styles from './Track.module.scss';
import {
  setSelectedTrack,
  setSelectedSample,
  hideSampleEffects,
  setShowPianoRoll,
  addSample as addSampleAction,
} from '../../actions/studioActions';

configure({
  allowCombinationSubmatches: true,
});

const Ticks = memo(({ gridSize, gridWidth, gridUnitWidth }) => {
  const ref = useRef();
  const { onDragOver, onDrop } = useDragEvents(ref, false);
  onDragOver((e) => {
    e.preventDefault();
  });

  onDrop((e) => {
    e.preventDefault();
  });

  const ticks = useMemo(() => (
    [...Array(Math.ceil(gridWidth * gridSize))]
      .map((__, i) => <rect key={i} x={i * gridUnitWidth} className={styles.tick} />)
  ), [gridSize, gridWidth, gridUnitWidth]);
  return (
    <svg
      onDrop={(e) => { e.stopPropagation(); }}
      onDragOver={(e) => { e.preventDefault(); }}
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
    dispatch, clipboard, track, className, gridSize, gridWidth, gridUnitWidth, index,
  } = props;

  const ref = useRef();
  const { onDrop, onDragOver } = useDragEvents(ref, false);

  onDragOver((event) => {
    event.preventDefault();
  });

  const addSample = useCallback((url, name, offsetX) => {
    const sampleState = {
      url,
      name,
      time: offsetX / gridUnitWidth,
      fade: {
        fadeIn: 0,
        fadeOut: 0,
      },
    };
    dispatch(addSampleAction(track.id, sampleState));
  }, [dispatch, gridUnitWidth, track.id]);

  onDrop((event) => {
    event.preventDefault();
    event.stopPropagation();
    const type = event.dataTransfer.getData('type');
    if (type !== 'file') {
      return;
    }
    const url = event.dataTransfer.getData('url');
    const name = event.dataTransfer.getData('name');

    addSample(url, name, event.offsetX);
  });

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
  }, [addSample, clipboard, dispatch, track.id]);

  const keyMap = {
    PASTE_SAMPLE: 'ctrl+v',
  };

  const handlers = {
    PASTE_SAMPLE: pasteSample,
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
      <div ref={ref}>
        <Ticks gridSize={gridSize} gridWidth={gridWidth} gridUnitWidth={gridUnitWidth} />
      </div>
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
  gridUnitWidth: PropTypes.number.isRequired,
};

Track.defaultProps = {
  className: '',
};

Track.displayName = 'Track';

const mapStateToProps = ({ studio, studioUndoable }) => ({
  tracks: studioUndoable.present.tracks,
  scroll: studio.scroll,
  selectedTrack: studio.selectedTrack,
  clipboard: studio.clipboard,
  test: studio.test,
  gridSize: studio.gridSize,
  gridWidth: studio.gridWidth,
  gridUnitWidth: studio.gridUnitWidth,
});

export default connect(mapStateToProps)(Track);
