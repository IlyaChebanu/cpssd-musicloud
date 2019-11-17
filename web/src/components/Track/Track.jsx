import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Track.module.scss';
import { connect } from 'react-redux';
import _ from 'lodash';
import { bufferStore } from '../../helpers/constants';
import { lerp, genId } from '../../helpers/utils';
import Sample from '../Sample/Sample';
import { setSelectedTrack, setTrackAtIndex } from '../../actions/studioActions';
import { HotKeys } from 'react-hotkeys';
import store from '../../store';

const Track = memo(props => {
  const ticks = useMemo(() => {
    return [...Array(1000)].map((_, i) => {
      return <rect x={i * 40} className={styles.tick}></rect>
    });
  }, []);

  const getSample = useCallback(sample => (
    <Sample
      sample={{ ...sample, track: props.index }}
      style={{
        position: 'absolute',
        transform: `translateX(${(sample.time - 1) * 40}px)`
      }}
      key={sample.id}
    />
  ), [props.index]);

  const handleSetSelected = useCallback(() => {
    props.dispatch(setSelectedTrack(props.index));
  }, [props.index]);

  const pasteSample = useCallback(() => {
    const sample = {...store.getState().studio.clipboard};
    if (_.isEmpty(sample)) {
      return;
    }
    const lastSample = props.track.samples[props.track.samples.length - 1];
    sample.id = genId();
    sample.time = lastSample ? lastSample.time + lastSample.duration * 60 / props.tempo : 1;
    props.track.samples.push(sample);
    props.dispatch(setTrackAtIndex(props.track, props.index));
  }, [props.clipboard, props.track, props.tempo, props.index]);

  const keyMap = {
    PASTE_SAMPLE: "ctrl+v"
  };

  const handlers = {
    PASTE_SAMPLE: pasteSample
  };

  return (
    <HotKeys keyMap={keyMap} handlers={handlers} className={`${styles.wrapper} ${props.index % 2 ? styles.even : ''}`} onMouseDown={handleSetSelected}>
      <svg className={styles.gridLines}>
        {ticks}
      </svg>
      {props.track.samples.map(getSample)}
    </HotKeys>
  );
});

Track.propTypes = {
  index: PropTypes.number.isRequired,
  track: PropTypes.object.isRequired,
};

const mapStateToProps = ({ studio }) => ({
  tracks: studio.tracks,
  scroll: studio.scroll,
  selectedTrack: studio.selectedTrack,
  clipboard: studio.clipboard,
  tempo: studio.tempo
});

export default connect(mapStateToProps)(Track);

