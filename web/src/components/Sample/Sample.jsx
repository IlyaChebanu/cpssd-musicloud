/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable react/no-array-index-key */
import React, {
  memo, useCallback, useMemo, useEffect, useState, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { HotKeys } from 'react-hotkeys';
import axios from 'axios';
import WaveSurfer from 'wavesurfer.js';
import ReactTooltip from 'react-tooltip';
import styles from './Sample.module.scss';
import {
  dColours, colours, bufferStore, audioContext,
} from '../../helpers/constants';
import {
  setSelectedSample,
  removeSample,
  setClipboard,
  hideSampleEffects,
  showSampleEffects,
  setShowPianoRoll,
  setSampleBufferLoading,
  setSampleStartTime,
  setSampleTrackId,
  setSelectedTrack,
  setSampleDuration,
  setSampleType,
} from '../../actions/studioActions';

import { ReactComponent as EditIcon } from '../../assets/icons/edit-sample.svg';
import { ReactComponent as PianoIcon } from '../../assets/icons/piano-keyboard-light.svg';
import Spinner from '../Spinner/Spinner';
import { useGlobalDrag } from '../../helpers/hooks';
import store from '../../store';

const Sample = memo((props) => {
  const {
    data,
    id,
    tempo,
    selectedSample,
    dispatch,
    gridSnapEnabled,
    gridSize,
    gridUnitWidth,
    tracks,
    sampleEffectsHidden,
    showPianoRoll,
  } = props;

  const ref = useRef();
  const [dragStartData, setDragStartData] = useState(data);
  const [samplePosition, setSamplePosition] = useState({ time: data.time, trackId: data.trackId });
  const { onDragStart, onDragging, onDragEnd } = useGlobalDrag(ref);

  useEffect(() => {
    setSamplePosition({ time: data.time, trackId: data.trackId });
  }, [data.time, data.trackId]);

  onDragStart(() => {
    setDragStartData({ ...data, trackIndex: _.findIndex(tracks, (o) => o.id === data.trackId) });
    dispatch(setSelectedSample(id));
    dispatch(setSelectedTrack(data.trackId));
  });

  onDragging(({
    oldX, oldY, x, y,
  }) => {
    const gridSizePx = gridUnitWidth * gridSize;
    const newStartTime = Math.max(1, dragStartData.time + (x - oldX) / gridSizePx);
    const numDecimalPlaces = Math.max(0, String(1 / gridSize).length - 2);
    const time = gridSnapEnabled
      ? Number((Math.round((newStartTime) * gridSize) / gridSize).toFixed(numDecimalPlaces))
      : newStartTime;

    const idxOffset = Math.round((y - oldY) / 100);
    const trackIdx = Math.min(tracks.length - 1, Math.max(0, dragStartData.trackIndex + idxOffset));
    const trackId = tracks[trackIdx].id;

    setSamplePosition({ time, trackId });
  });

  onDragEnd(() => {
    if (data.time !== samplePosition.time) {
      dispatch(setSampleStartTime(id, samplePosition.time));
    }
    if (data.trackId !== samplePosition.trackId) {
      dispatch(setSampleTrackId(id, samplePosition.trackId));
    }
  });

  const trackIndexLocal = useMemo(() => (
    _.findIndex(tracks, (t) => t.id === samplePosition.trackId)
  ), [samplePosition.trackId, tracks]);


  const [buffer, setBuffer] = useState(bufferStore[data.url]);
  useEffect(() => {
    if (!buffer && data.url) {
      dispatch(setSampleBufferLoading(id, true));
      axios
        .get(data.url, { responseType: 'arraybuffer' })
        .then((res) => {
          audioContext
            .decodeAudioData(res.data)
            .then((buf) => {
              bufferStore[data.url] = buf;
              setBuffer(buf);
              dispatch(setSampleBufferLoading(id, false));
              const currentTempo = store.getState().studio.tempo;
              if (data.type === 'sample') {
                const duration = parseFloat((buf.duration * (currentTempo / 60)).toFixed(16));
                dispatch(setSampleDuration(id, duration));
              }
            });
        });
    } else if (buffer && data.url && data.type === 'sample') {
      const duration = parseFloat((buffer.duration * (tempo / 60)).toFixed(16));
      dispatch(setSampleDuration(id, duration));
    }
  }, [buffer, data.type, data.url, dispatch, id, tempo]);

  const sample = data;

  const gridSizePx = gridUnitWidth * gridSize;
  const ppq = 1; // TODO: Unhardcode
  useEffect(() => {
    if (data.type === 'pattern') {
      const latest = _.maxBy(Object.values(data.notes), (n) => n.tick + n.duration);
      const duration = parseFloat(
        ((0.25 / ppq) * (latest ? latest.tick + latest.duration : 4 * ppq)).toFixed(16),
      );
      dispatch(setSampleDuration(
        id,
        duration,
      ));
    }
  }, [data.notes, data.type, dispatch, gridSize, id, tempo]);


  const numNotes = Object.keys(data.notes).length;
  useEffect(() => {
    if (!numNotes && data.url && data.type === 'pattern') {
      dispatch(setSampleType(id, 'sample'));
    } else if (numNotes && data.type === 'sample') {
      dispatch(setSampleType(id, 'pattern'));
    }
  }, [data.type, data.url, dispatch, id, numNotes]);

  const wrapperStyle = useMemo(() => {
    const colourIdx = trackIndexLocal % dColours.length;
    const selected = id === selectedSample;
    let width;
    if (data.bufferLoading) {
      width = 55;
    } else {
      width = data.duration * gridSizePx;
    }
    return {
      width,
      position: 'absolute',
      top: 0,
      left: 0,
      transform: `translateX(${(samplePosition.time - 1) * gridSizePx}px) translateY(${trackIndexLocal * 100}px)`,
      backgroundColor: selected ? colours[colourIdx] : dColours[colourIdx],
      zIndex: selected ? 2 : 1,
    };
  // eslint-disable-next-line max-len
  }, [trackIndexLocal, id, selectedSample, data.bufferLoading, data.duration, samplePosition.time, gridSizePx]);

  const container = ref.current;
  const wavesurfer = useRef();
  useEffect(() => {
    if (container && buffer && data.duration && data.type === 'sample') {
      if (!wavesurfer.current) {
        wavesurfer.current = WaveSurfer.create({
          container,
          waveColor: '#eee',
          height: 90,
          interact: false,
          barWidth: 1,
          barRadius: 0.5,
          barGap: 2,
          hideScrollbar: true,
        });
      }
      setTimeout(() => wavesurfer.current.loadDecodedBuffer(buffer), 200);
    } else if (wavesurfer.current && data.type === 'pattern') {
      wavesurfer.current.destroy();
      wavesurfer.current = null;
    }
  }, [buffer, container, data.duration, data.type, gridUnitWidth, gridSize, tempo]);

  const patternPreview = useMemo(() => {
    const highestNote = _.maxBy(Object.values(data.notes), (n) => n.noteNumber);
    const lowestNote = _.minBy(Object.values(data.notes), (n) => n.noteNumber);
    if (!highestNote || !lowestNote) {
      return null;
    }
    const height = highestNote.noteNumber - lowestNote.noteNumber;
    return (
      <div className={styles.previewWrapper}>
        <div
          className={styles.previewNoteWrapper}
          style={{ height }}
        >
          {Object.entries(data.notes).map(([noteId, note]) => (
            <div
              className={styles.previewNote}
              key={noteId}
              style={{
                height: '2px',
                width: `${note.duration * (0.25 / ppq) * gridSizePx}px`,
                top: `${(88 - note.noteNumber - (88 - highestNote.noteNumber))}px`,
                left: `${note.tick * (0.25 / ppq) * gridSizePx}px`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }, [data.notes, gridSizePx]);

  const deleteSample = useCallback(() => {
    dispatch(removeSample(id));
  }, [dispatch, id]);

  const copySample = useCallback(() => {
    dispatch(setClipboard(sample));
  }, [dispatch, sample]);

  const keyMap = {
    COPY_SAMPLE: 'ctrl+c',
    DELETE_SAMPLE: ['del', 'backspace'],
  };

  const handlers = {
    DELETE_SAMPLE: deleteSample,
    COPY_SAMPLE: copySample,
  };

  const handleShowHideSampleEffects = useCallback((e) => {
    e.preventDefault();
    if (sampleEffectsHidden) {
      dispatch(showSampleEffects());
    } else {
      dispatch(hideSampleEffects());
    }
  }, [dispatch, sampleEffectsHidden]);

  const handleTogglePiano = useCallback((e) => {
    e.preventDefault();
    dispatch(setShowPianoRoll(!showPianoRoll));
  }, [dispatch, showPianoRoll]);


  return (
    <HotKeys
      allowChanges
      keyMap={keyMap}
      handlers={handlers}
      className={styles.wrapper}
      style={{ ...wrapperStyle, ...props.style }}
      innerRef={ref}
    >
      <div className={styles.fadeWrapper}>
        {id === selectedSample && !!(data.fade.fadeIn || data.fade.fadeOut) && (
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" fill="rgba(0, 0, 0, 0.3)">
            <path d={`M 0 0 L ${data.fade.fadeIn * 100} 0 L 0 100`} />
            <path d={`M ${(1 - data.fade.fadeOut) * 100} 0 L 100 0 L 100 100`} />
          </svg>
        )}
      </div>
      <p>{id === selectedSample && data.name}</p>
      {id === selectedSample
        && (
          <div className={styles.edit}>
            <EditIcon
              onMouseOver={ReactTooltip.rebuild}
              data-tip="Edit sample name and add effects"
              data-for="tooltip"
              data-place="right"
              onClick={handleShowHideSampleEffects}
            />
            <PianoIcon
              onMouseOver={ReactTooltip.rebuild}
              data-tip="Edit in the piano roll"
              data-place="right"
              data-for="tooltip"
              onClick={handleTogglePiano}
            />
          </div>

        )}
      {data.bufferLoading && <Spinner className={styles.spinner} />}
      {!data.bufferLoading && data.type === 'pattern' && patternPreview}
    </HotKeys>
  );
});

Sample.propTypes = {
  style: PropTypes.object,
  data: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  tempo: PropTypes.number.isRequired,
  selectedSample: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  gridSnapEnabled: PropTypes.bool.isRequired,
  gridSize: PropTypes.number.isRequired,
  gridUnitWidth: PropTypes.number.isRequired,
  tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
  sampleEffectsHidden: PropTypes.bool.isRequired,
  showPianoRoll: PropTypes.bool.isRequired,
};

Sample.defaultProps = {
  style: {},
};

Sample.displayName = 'Sample';

const mapStateToProps = ({ studio, studioUndoable }) => ({
  sampleLoading: studio.sampleLoading,
  tempo: studio.tempo,
  gridSnapEnabled: studio.gridSnapEnabled,
  gridSize: studio.gridSize,
  gridUnitWidth: studio.gridUnitWidth,
  selectedSample: studio.selectedSample,
  tracks: studioUndoable.present.tracks,
  sampleEffectsHidden: studio.sampleEffectsHidden,
  showPianoRoll: studio.showPianoRoll,
});

export default connect(mapStateToProps)(Sample);
