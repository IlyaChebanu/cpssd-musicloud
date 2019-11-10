import React, { useCallback, memo, useEffect } from 'react';
import styles from './Studio.module.scss';
import Header from '../../components/Header';
import { play, pause, stop, setTempo, setVolume, setTracks } from '../../actions/studioActions';
import { connect } from 'react-redux';
import kick from '../../assets/samples/kick23.wav';
import bass from '../../assets/samples/bass.wav';

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
    props.dispatch(setTempo(Math.max(Number(e.target.value), 0)));
  }, []);

  const handleVolume = useCallback(e => {
    props.dispatch(setVolume(Math.max(Number(e.target.value), 0)));
  }, []);

  useEffect(() => {
    dispatch(setTracks([
      {
        volume: 0.25,
        samples: [
          {
            id: 1,
            time: 1,
            url: bass
          },
          {
            id: 3,
            time: 3,
            url: bass
          },
        ]
      },
      {
        volume: 1,
        samples: [
          {
            id: 2,
            time: 2,
            url: bass
          },
          {
            id: 4,
            time: 4,
            url: bass
          },
        ]
      }
    ]));
  }, []);

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
        <p>Volume:<input type='text' defaultValue={1} onChange={handleVolume}/></p>
      </div>
    </div>
  );
});

Studio.propTypes = {

};

const mapStateToProps = ({ studio }) => ({ studio });

export default connect(mapStateToProps)(Studio);

