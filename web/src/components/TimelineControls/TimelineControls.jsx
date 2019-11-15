import React, { memo, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './TimelineControls.module.scss';
import { connect } from 'react-redux';
import { setTempo, setGridSnapEnabled, setLoopEnabled } from '../../actions/studioActions';
import store from '../../store';

import { ReactComponent as Snap } from '../../assets/icons/magnet-light.svg';
import { ReactComponent as SnapActive } from '../../assets/icons/magnet-regular.svg';
import { ReactComponent as Loop } from '../../assets/icons/repeat-alt-light.svg';
import { ReactComponent as LoopActive } from '../../assets/icons/repeat-alt-regular.svg';
import { ReactComponent as Grid } from '../../assets/icons/th-large-light.svg';

const TimelineControls = memo(props => {

  const [tempoInput, setTempoInput] = useState(props.tempo);

  const handleChange = useCallback(e => {
    setTempoInput(e.target.value);
  }, []);

  const handleSetTempo = useCallback(() => {
    const newTempo = Math.min(500, Math.max(1, Number(tempoInput) || 1));
    props.dispatch(setTempo(newTempo));
    setTempoInput(newTempo);
  }, [tempoInput]);

  const handleKeyDown = useCallback(e => {
    if (e.key === 'Enter') {
      handleSetTempo();
    }
  }, [handleSetTempo]);

  const handleGridSnapClick = useCallback(() => {
    props.dispatch(setGridSnapEnabled(!props.gridSnapEnabled));
  }, [props.gridSnapEnabled]);

  const handleLoopClick = useCallback(() => {
    props.dispatch(setLoopEnabled(!props.loopEnabled));
  }, [props.loopEnabled]);

  return (
    <div className={styles.wrapper}>
      <span><input type='text' value={tempoInput} onChange={handleChange} onBlur={handleSetTempo} onKeyDown={handleKeyDown}/><p>BPM</p></span>
      {props.gridSnapEnabled ? <SnapActive onClick={handleGridSnapClick}/> : <Snap onClick={handleGridSnapClick}/>}
      <Grid/>
      {props.loopEnabled ? <LoopActive onClick={handleLoopClick}/> : <Loop onClick={handleLoopClick}/>}
    </div>
  );
});

TimelineControls.propTypes = {
};

const mapStateToProps = ({ studio }) => ({
  tempo: studio.tempo,
  gridSnapEnabled: studio.gridSnapEnabled,
  loopEnabled: studio.loopEnabled,
});

export default connect(mapStateToProps)(TimelineControls);

