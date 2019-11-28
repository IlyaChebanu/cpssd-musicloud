import React, { memo, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './TimelineControls.module.scss';
import { setTempo, setGridSnapEnabled, setLoopEnabled } from '../../actions/studioActions';

import { ReactComponent as Snap } from '../../assets/icons/magnet-light.svg';
import { ReactComponent as SnapActive } from '../../assets/icons/magnet-regular.svg';
import { ReactComponent as Loop } from '../../assets/icons/repeat-alt-light.svg';
import { ReactComponent as LoopActive } from '../../assets/icons/repeat-alt-regular.svg';
import { ReactComponent as Grid } from '../../assets/icons/th-large-light.svg';

const TimelineControls = memo((props) => {
  const {
    tempo, dispatch, gridSnapEnabled, loopEnabled,
  } = props;
  const [tempoInput, setTempoInput] = useState(tempo);

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

  return (
    <div className={styles.wrapper}>
      <span>
        <input type="text" value={tempoInput} onChange={handleChange} onBlur={handleSetTempo} onKeyDown={handleKeyDown} />
        <p>BPM</p>
      </span>
      {gridSnapEnabled
        ? <SnapActive onClick={handleGridSnapClick} />
        : <Snap onClick={handleGridSnapClick} />}
      <Grid />
      {loopEnabled
        ? <LoopActive onClick={handleLoopClick} />
        : <Loop onClick={handleLoopClick} />}
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
