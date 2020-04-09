import React, {
  memo, useCallback, useMemo, useRef,
} from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import styles from './SeekBar.module.scss';
import { ReactComponent as SeekBarSvg } from '../../assets/seekbar.svg';
import {
  setCurrentBeat, play, pause, setDraggingSeekBar,
} from '../../actions/studioActions';

const SeekBar = memo((props) => {
  const {
    playing, dispatch, gridSize, draggingSeekBar, currentBeatStudio, dataTip,
  } = props;

  const currentBeat = props.currentBeat ? props.currentBeat : currentBeatStudio;
  const ref = useRef();
  const scaleFactor = props.scaleFactor || gridSize;
  const scroll = props.scrollPosition !== null ? props.scrollPosition : props.scroll;

  const handleDragStart = useCallback((ev) => {
    dispatch(setDraggingSeekBar(true));
    dispatch(pause);
    const mousePosOffset = ev.screenX;
    const startBeat = currentBeat;
    const handleMouseMove = (e) => {
      ReactTooltip.hide(ref.current);
      e.preventDefault();
      dispatch(
        setCurrentBeat(
          Math.max(
            1,
            startBeat + (e.screenX - mousePosOffset) / (40 * scaleFactor) / window.devicePixelRatio,
          ),
        ),
      );
    };
    const handleDragStop = () => {
      // Only plays if the music was playing when handleDragStart was called
      if (playing) {
        dispatch(play);
      }
      dispatch(setDraggingSeekBar(false));
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [currentBeat, dispatch, playing, scaleFactor]);

  const offset = props.currentBeat ? 0 : 220;
  const iconStyle = useMemo(() => {
    const pos = -7 + offset + (currentBeat - 1) * (40 * scaleFactor) - scroll;
    return {
      transform: `translate(${pos}px, -0px)`,
      opacity: pos >= offset - 7 ? 1 : 0,
    };
  }, [offset, currentBeat, scaleFactor, scroll]);

  const barStyle = useMemo(() => {
    const pos = offset + (currentBeat - 1) * (40 * scaleFactor) - scroll;
    return {
      transform: `translate(${pos}px, 60px)`,
      opacity: pos >= offset ? 1 : 0,
    };
  }, [offset, currentBeat, scaleFactor, scroll]);
  return (
    <div
      className={styles.wrapper}
    >
      <SeekBarSvg
        ref={(r) => { ref.current = r; }}
        data-tip={!draggingSeekBar ? dataTip : ''}
        data-for="tooltip"
        data-place="right"
        style={iconStyle}
        onMouseDown={handleDragStart}
      />
      <div className={styles.bar} style={barStyle} />
    </div>
  );
});

SeekBar.propTypes = {
  currentBeat: PropTypes.number,
  currentBeatStudio: PropTypes.number.isRequired,
  scroll: PropTypes.number.isRequired,
  playing: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  gridSize: PropTypes.number.isRequired,
  scaleFactor: PropTypes.number,
  scrollPosition: PropTypes.number,
  dataTip: PropTypes.string,
  draggingSeekBar: PropTypes.bool.isRequired,
};

SeekBar.defaultProps = {
  currentBeat: 0,
  scaleFactor: null,
  scrollPosition: null,
  dataTip: '',
};

SeekBar.displayName = 'SeekBar';

const mapStateToProps = ({ studio }) => ({
  currentBeatStudio: studio.currentBeat,
  scroll: studio.scroll,
  playing: studio.playing,
  gridSize: studio.gridSize,
  draggingSeekBar: studio.draggingSeekBar,
});

export default connect(mapStateToProps)(SeekBar);
