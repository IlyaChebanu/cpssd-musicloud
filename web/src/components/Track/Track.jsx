import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Track.module.scss';
import { connect } from 'react-redux';
import _ from 'lodash';
import { bufferStore } from '../../helpers/constants';
import { lerp } from '../../helpers/utils';
import Sample from '../Sample/Sample';
import { setSelectedTrack } from '../../actions/studioActions';

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
    />
  ), [props.index]);

  const handleSetSelected = useCallback(() => {
    props.dispatch(setSelectedTrack(props.index));
  }, [props.index]);

  return (
    <div className={`${styles.wrapper} ${props.index % 2 ? styles.even : ''}`} onMouseDown={handleSetSelected}>
      <svg className={styles.gridLines}>
        {ticks}
      </svg>
      {props.track.samples.map(getSample)}
    </div>
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
});

export default connect(mapStateToProps)(Track);

