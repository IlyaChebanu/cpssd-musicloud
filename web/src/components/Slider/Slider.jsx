import React, { memo, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { setVolume } from '../../actions/studioActions';
import styles from './Slider.module.scss';
import { ReactComponent as Volume } from '../../assets/icons/volume.svg';
import { ReactComponent as VolumeIndicator } from '../../assets/icons/volume-button.svg';
import { clamp, lerp } from '../../helpers/utils';

const Slider = memo(props => {
  const volume = props.volume;

  const handleDragStart = useCallback(e => {
    const initialMousePos = e.screenX;
    const initialVolume = volume;
    const handleMouseMove = e => {
      props.dispatch(setVolume(clamp(0, 1, initialVolume + (e.screenX - initialMousePos) / 165)));
    }
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [volume]);

  const iconStyle = useMemo(() => {
    var pos = lerp(15, 180, volume)
    return {
      transform: `translate(${pos}px, -0px)`,
    };
  }, [volume]);

  return (
    <div className={styles.wrapper}>
      <VolumeIndicator style={iconStyle} onMouseDown={handleDragStart} />
      <Volume />
    </div>
  )
})

const mapStateToProps = ({ studio }) => ({
  volume: studio.volume,
  scroll: studio.scroll,
  playing: studio.playing
});

export default connect(mapStateToProps)(Slider);

