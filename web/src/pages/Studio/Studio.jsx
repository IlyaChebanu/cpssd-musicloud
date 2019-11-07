import React, { useCallback, memo } from 'react';
import styles from './Studio.module.scss';
import Header from '../../components/Header';
import { play, pause, stop, setTempo } from '../../actions/studioActions';
import { connect } from 'react-redux';

const Studio = memo(props => {
  const { dispatch } = props;

  const handlePlay = useCallback(() => {
    props.dispatch(play);
  }, []);

  const handlePlause = useCallback(() => {
    props.dispatch(pause);
  }, []);

  const handleStop = useCallback(() => {
    props.dispatch(stop);
  }, []);

  const handleTempo = useCallback(e => {
    props.dispatch(setTempo(Number(e.target.value) || 1));
  }, [])

  return (
    <div className={styles.wrapper}>
      <Header selected={0}/>
      <div className={styles.contentWrapper}>
        <button onClick={handlePlay}>Play</button>
        <button onClick={handlePlause}>Pause</button>
        <button onClick={handleStop}>Stop</button>
        <p>BPM Input:<input type='text' defaultValue={90} onChange={handleTempo}/></p>
        <p>Current BPM: {props.studio.tempo}</p>
        <p>Beat number: {props.studio.currentBeat}</p>
      </div>
    </div>
  );
});

Studio.propTypes = {

};

const mapStateToProps = ({ studio }) => ({ studio });

export default connect(mapStateToProps)(Studio);

