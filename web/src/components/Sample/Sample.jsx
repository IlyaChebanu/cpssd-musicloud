/* eslint-disable react/no-array-index-key */
import React, {
  memo, useCallback, useMemo, useEffect, useState, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { HotKeys } from 'react-hotkeys';
import axios from 'axios';
import styles from './Sample.module.scss';
import {
  dColours, colours, bufferStore, audioContext,
} from '../../helpers/constants';
import { lerp } from '../../helpers/utils';
import {
  setSampleTime,
  // setTrackAtIndex,
  setSelectedSample,
  removeSample,
  setClipboard,
  hideSampleEffects,
  showSampleEffects,
  setShowPianoRoll,
  setSampleBufferLoading,
  setSampleStartTime,
  setSampleTrackId,
  setSampleBuffer,
  setSelectedTrack,
} from '../../actions/studioActions';

import editIcon from '../../assets/icons/edit-sample.svg';
import { showNotification } from '../../actions/notificationsActions';
import Spinner from '../Spinner/Spinner';
import { useGlobalDrag } from '../../helpers/hooks';

const Sample = memo((props) => {
  const {
    data,
    id,
    tempo,
    selectedSample,
    dispatch,
    gridSnapEnabled,
    gridSize,
    tracks,
    sampleEffectsHidden,
    showPianoRoll,
  } = props;

  const ref = useRef();
  const [dragStartData, setDragStartData] = useState(data);
  const { onDragStart, onDragging } = useGlobalDrag(ref);

  onDragStart(() => {
    setDragStartData({ ...data, trackIndex: _.findIndex(tracks, (o) => o.id === data.trackId) });
    dispatch(setSelectedSample(id));
    dispatch(setSelectedTrack(data.trackId));
  });

  onDragging(({
    oldX, oldY, x, y,
  }) => {
    const gridSizePx = 40 * gridSize; // TODO: change hardcoded value to redux
    const newStartTime = dragStartData.time + (x - oldX) / gridSizePx;
    const numDecimalPlaces = Math.max(0, String(1 / gridSize).length - 2);
    const time = gridSnapEnabled
      ? Number((Math.round((newStartTime) * gridSize) / gridSize).toFixed(numDecimalPlaces))
      : newStartTime;

    const idxOffset = Math.round((y - oldY) / 100);
    const trackIdx = Math.min(tracks.length - 1, Math.max(0, dragStartData.trackIndex + idxOffset));
    const trackId = tracks[trackIdx].id;

    dispatch(setSampleStartTime(id, time));
    dispatch(setSampleTrackId(id, trackId));
  });

  const trackIndex = useMemo(() => (
    _.findIndex(tracks, (t) => t.id === data.trackId)
  ), [data.trackId, tracks]);

  const [buffer, setBuffer] = useState(bufferStore[data.url]);
  useEffect(() => {
    if (!buffer) {
      setSampleBufferLoading(id, true);
      axios
        .get(data.url, { responseType: 'arraybuffer' })
        .then((res) => {
          audioContext
            .decodeAudioData(res.data)
            .then((buf) => {
              bufferStore[data.url] = buf;
              setBuffer(buf);
              dispatch(setSampleBufferLoading(id, false));
            });
        });
    }
  }, [buffer, data, data.url, dispatch, id]);

  const sample = data;

  const waveform = useMemo(() => {
    if (buffer) {
      const channelData = buffer.getChannelData(0);
      const beatsPerSecond = tempo / 60;
      const width = buffer.duration * beatsPerSecond * (40 * gridSize);
      const step = Math.ceil(width / 2);
      const amp = 80;
      const bars = [];
      for (let i = 0; i < step; i += 1) {
        const d = _.clamp(channelData[Math.floor(lerp(0, channelData.length, i / step))], -1, 1);
        bars.push(Math.max(2, Math.abs(Math.floor(d * amp))));
      }
      return (
        <svg className={styles.waveform}>
          {bars.map((bar, i) => (
            <rect
              key={i}
              x={(i + 1) * 2}
              y={45 - bar / 2}
              style={{ height: `${bar}px` }}
              className={styles.bar}
            />
          ))}
        </svg>
      );
    }
    return (
      <Spinner className={styles.spinner} />
    );
  }, [buffer, gridSize, tempo]);

  const wrapperStyle = useMemo(() => {
    const colourIdx = trackIndex % dColours.length;
    const selected = id === selectedSample;
    const ppq = 1; // TODO: Unhardcode
    let width;
    if (sample.type === 'pattern') {
      const latest = _.maxBy(sample.notes, (n) => n.tick + n.duration);
      width = (0.25 / ppq) * (latest ? latest.tick + latest.duration : 4 * ppq) * (40 * gridSize);
    }
    const gridSizePx = 40 * gridSize; // TODO: change hardcoded value to redux
    return {
      width,
      position: 'absolute',
      top: 0,
      left: 0,
      transform: `translateX(${(data.time - 1) * gridSizePx}px) translateY(${trackIndex * 100}px)`,
      backgroundColor: selected ? colours[colourIdx] : dColours[colourIdx],
      zIndex: selected ? 2 : 1,
    };
  }, [trackIndex, id, selectedSample, sample.type, sample.notes, gridSize, data.time]);

  const deleteSample = useCallback(() => {
    dispatch(removeSample(id));
  }, [dispatch, id]);

  const copySample = useCallback(() => {
    dispatch(setClipboard(sample));
  }, [dispatch, sample]);

  const keyMap = {
    COPY_SAMPLE: 'ctrl+c',
    DELETE_SAMPLE: 'del',
  };

  const handlers = {
    DELETE_SAMPLE: deleteSample,
    COPY_SAMPLE: copySample,
  };

  const handleShowHideSampleEffects = useCallback(() => {
    if (sampleEffectsHidden) {
      dispatch(showSampleEffects());
    } else {
      dispatch(hideSampleEffects());
    }
  }, [dispatch, sampleEffectsHidden]);

  const handleTogglePiano = useCallback(() => {
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
      // onMouseDown={handleDragSample}
    >
      <p>{id === selectedSample ? data.name : ''}</p>
      {id === selectedSample
        ? (
          <img
            onClick={data.type === 'pattern' ? handleTogglePiano : handleShowHideSampleEffects}
            className={sampleEffectsHidden ? styles.edit : `${styles.editing} ${styles.edit}`}
            src={editIcon}
            alt="edit sample icon"
          />
        ) : ''}
      {data.type === 'pattern' ? '' : waveform}
      <div className={styles.fadeWrapper}>
        {id === selectedSample && !!(data.fade.fadeIn || data.fade.fadeOut) && (
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" fill="rgba(0, 0, 0, 0.3)">
            <path d={`M 0 100 L ${data.fade.fadeIn * 100} 0 L ${(1 - data.fade.fadeOut) * 100} 0 L 100 100`} />
          </svg>
        )}
      </div>
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
  tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
  sampleEffectsHidden: PropTypes.bool.isRequired,
  showPianoRoll: PropTypes.bool.isRequired,
};

Sample.defaultProps = {
  style: {},
};

Sample.displayName = 'Sample';

const mapStateToProps = ({ studio }) => ({
  sampleLoading: studio.sampleLoading,
  tempo: studio.tempo,
  gridSnapEnabled: studio.gridSnapEnabled,
  gridSize: studio.gridSize,
  selectedSample: studio.selectedSample,
  tracks: studio.tracks,
  sampleEffectsHidden: studio.sampleEffectsHidden,
  showPianoRoll: studio.showPianoRoll,
});

export default connect(mapStateToProps)(Sample);
