import React, {
  memo, useState, useCallback, useMemo, useEffect,
} from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './TimelineControls.module.scss';
import {
  setTempo, setGridSnapEnabled, setLoopEnabled, setGridSize,
} from '../../actions/studioActions';

import { ReactComponent as Snap } from '../../assets/icons/magnet-light.svg';
import { ReactComponent as SnapActive } from '../../assets/icons/magnet-regular.svg';
import { ReactComponent as Loop } from '../../assets/icons/repeat-alt-light.svg';
import { ReactComponent as LoopActive } from '../../assets/icons/repeat-alt-regular.svg';
import { ReactComponent as Grid } from '../../assets/icons/th-large-light.svg';

import Dropdown from '../Dropdown';

const TimelineControls = memo((props) => {
  const {
    tempo, dispatch, gridSnapEnabled, loopEnabled,
  } = props;
  const [tempoInput, setTempoInput] = useState(tempo);

  useEffect(() => {
    if (tempoInput !== tempo) {
      setTempoInput(tempo);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempo]);

  const handleChange = useCallback((e) => {
    setTempoInput(e.target.value);
  }, []);

  const handleSetTempo = useCallback(() => {
    const newTempo = Math.min(500, Math.max(1, Number(tempoInput) || 1));
    dispatch(setTempo(newTempo));
    setTempoInput(newTempo);
  }, [dispatch, tempoInput]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSetTempo();
    }
  }, [handleSetTempo]);

  const handleGridSnapClick = useCallback(() => {
    dispatch(setGridSnapEnabled(!gridSnapEnabled));
  }, [dispatch, gridSnapEnabled]);

  const handleLoopClick = useCallback(() => {
    dispatch(setLoopEnabled(!loopEnabled));
  }, [dispatch, loopEnabled]);

  const gridDropdownItems = useMemo(() => [
    {
      name: '1/1',
      action() {
        dispatch(setGridSize(1));
      },
    },
    {
      name: '1/2',
      action() {
        dispatch(setGridSize(2));
      },
    },
    {
      name: '1/4',
      action() {
        dispatch(setGridSize(4));
      },
    },
    {
      name: '1/8',
      action() {
        dispatch(setGridSize(8));
      },
    },
    {
      name: '1/16',
      action() {
        dispatch(setGridSize(16));
      },
    },
    {
      name: '1/32',
      action() {
        dispatch(setGridSize(32));
      },
    },
  ], [dispatch]);

  return (
    <div className={styles.wrapper}>
      <span>
        <input type="text" value={tempoInput} onChange={handleChange} onBlur={handleSetTempo} onKeyDown={handleKeyDown} />
        <p>BPM</p>
      </span>
      {gridSnapEnabled
        ? <SnapActive onClick={handleGridSnapClick} className={styles.icon} />
        : <Snap onClick={handleGridSnapClick} className={styles.icon} />}
      <Dropdown items={gridDropdownItems} title={<Grid />} />
      {loopEnabled
        ? <LoopActive onClick={handleLoopClick} className={styles.icon} />
        : <Loop onClick={handleLoopClick} className={styles.icon} />}
    </div>
  );
});

TimelineControls.propTypes = {
  dispatch: PropTypes.func.isRequired,
  tempo: PropTypes.number.isRequired,
  gridSnapEnabled: PropTypes.bool.isRequired,
  loopEnabled: PropTypes.bool.isRequired,
};

TimelineControls.displayName = 'TimelineControls';

const mapStateToProps = ({ studio }) => ({
  tempo: studio.tempo,
  gridSnapEnabled: studio.gridSnapEnabled,
  loopEnabled: studio.loopEnabled,
});

export default connect(mapStateToProps)(TimelineControls);
