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
  setSamplePatchId,
  setSamplePatch,
  hideSampleEffects,
  setShowPianoRoll,
  addSample as addSampleAction,
  resetSampleSelection,
} from '../../actions/studioActions';

configure({
  allowCombinationSubmatches: true,
});

const Ticks = memo(({
  gridSize, gridWidth, gridUnitWidth,
}) => {
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
    dispatch, clipboard, track, className, gridSize, gridWidth, gridUnitWidth,
    index, samples, selectedSample,
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

  const addSynth = useCallback((name, offsetX, patch, id) => {
    console.log(patch);
    const synthState = {
      name,
      time: offsetX / gridUnitWidth,
      fade: {
        fadeIn: 0,
        fadeOut: 0,
      },
      type: 'pattern',
      duration: 0,
      notes: [],
      patch,
      patchId: id,
    };
    console.log(synthState);
    if (!selectedSample) {
      return dispatch(addSampleAction(track.id, synthState));
    }
    dispatch(setSamplePatchId(selectedSample, id));
    dispatch(setSamplePatch(selectedSample, patch));
  }, [dispatch, gridUnitWidth, selectedSample, track.id]);

  onDrop((event) => {
    event.preventDefault();
    event.stopPropagation();
    const type = event.dataTransfer.getData('type');
    if (type !== 'file' && type !== 'synth') {
      return;
    }
    const name = event.dataTransfer.getData('name');
    if (type === 'file') {
      const url = event.dataTransfer.getData('url');
      addSample(url, name, event.offsetX);
    } else if (type === 'synth') {
      const id = event.dataTransfer.getData('id');
      const decay = parseFloat(event.dataTransfer.getData('decay'));
      const attack = parseFloat(event.dataTransfer.getData('attack'));
      const release = parseFloat(event.dataTransfer.getData('release'));
      const sustain = parseFloat(event.dataTransfer.getData('sustain'));
      const oscillator = event.dataTransfer.getData('oscillator');
      addSynth(name, event.offsetX, {
        envelope: {
          decay, attack, release, sustain,
        },
        oscillator: { type: oscillator },
      }, id);
    }
  });

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

      let trackSamples;
      if (tracksInClipboard.length > 1) {
        trackSamples = Object.values(samples).filter(
          (s) => tracksInClipboard.includes(s.trackId),
        );
      } else {
        trackSamples = Object.values(samples).filter(
          (s) => s.trackId === track.id,
        );
      }
      const latestInTrack = _.maxBy(
        trackSamples,
        (o) => o.time + o.duration,
      ) || { time: 1, duration: 0 };
      const earliestInClipboard = _.minBy(clipboard, (s) => s.time);

      clipboard.forEach((clipSample) => {
        const newSample = { ...clipSample };

        newSample.time += (latestInTrack.time + latestInTrack.duration - earliestInClipboard.time);
        if (tracksInClipboard.length > 1) {
          dispatch(addSampleAction(newSample.trackId, newSample));
        } else {
          dispatch(addSampleAction(track.id, newSample));
        }
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
  clipboard: PropTypes.array.isRequired,
  className: PropTypes.string,
  gridSize: PropTypes.number.isRequired,
  gridWidth: PropTypes.number.isRequired,
  gridUnitWidth: PropTypes.number.isRequired,
  samples: PropTypes.object.isRequired,
  selectedSample: PropTypes.string.isRequired,
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
  selectedSample: studio.selectedSample,
});

export default connect(mapStateToProps)(Track);
