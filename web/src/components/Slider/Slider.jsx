import React, { memo, useState, useCallback, useMemo } from 'react';
import { ReactComponent as SeekBarSvg } from '../../assets/seekbar.svg';
import { connect } from 'react-redux';
import { setVolume, play, pause } from '../../actions/studioActions';
import store from '../../store';
import styles from './Slider.module.scss';
import { ReactComponent as Volume } from '../../assets/icons/volume.svg';
import { ReactComponent as VolumeIndicator } from '../../assets/icons/volume-button.svg';
import { clamp, lerp } from '../../helpers/utils';

const Slider = memo(props => {
    const volume = props.volume;

    const handleDragStart = useCallback(() => {
        const handleMouseMove = e => {
          const volume = store.getState().studio.volume;
          props.dispatch(setVolume(clamp(0, 1, (e.screenX - 15) / 165)));
        }
        const handleDragStop = () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleDragStop);
        }
    
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleDragStop);
      });
    
      const iconStyle = useMemo(() => {
        var pos = lerp(15, 180, volume)
        return {
          transform: `translate(${pos}px, -0px)`,  
        };
      }, [volume]);
    
    return (
        <div className={styles.wrapper}>
            <VolumeIndicator style={iconStyle} onMouseDown={handleDragStart}/>
            <Volume/>
        </div>
    )
})

const mapStateToProps = ({ studio }) => ({
    volume: studio.volume,
    scroll: studio.scroll,
    playing: studio.playing
  });
  
  export default connect(mapStateToProps)(Slider);

