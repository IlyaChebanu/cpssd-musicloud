import React, { memo, useState, useCallback, useMemo } from 'react';
import { ReactComponent as SeekBarSvg } from '../../assets/seekbar.svg';
import { connect } from 'react-redux';
import { setVolume, play, pause } from '../../actions/studioActions';
import store from '../../store';
// import styled from 'styled-components';

// const sliderThumbStyles = (props) => (`
//   width: 25px;
//   height: 25px;
//   background: ${props.color};
//   cursor: pointer;
//   outline: 5px solid #333;
//   opacity: ${props.opacity};
//   -webkit-transition: .2s;
//   transition: opacity .2s;
// `);

// const Styles = styled.div`
//   display: flex;
//   align-items: center;
//   color: #888;
//   margin-top: 2rem;
//   margin-bottom: 2rem;
//   .value {
//     flex: 1;
//     font-size: 2rem;
//   }
//   .slider {
//     flex: 6;
//     -webkit-appearance: none;
//     width: 100%;
//     height: 15px;
//     border-radius: 5px;
//     background: #efefef;
//     outline: none;
//     &::-webkit-slider-thumb {
//       -webkit-appearance: none;
//       appearance: none;
//       ${props => sliderThumbStyles(props)}
//     }
//     &::-moz-range-thumb {
//       ${props => sliderThumbStyles(props)}
//     }
//   }
// `;



import PropTypes from 'prop-types';
import styles from './Slider.module.scss';
import { ReactComponent as Volume } from '../../assets/icons/volume.svg';
import { ReactComponent as VolumeIndicator } from '../../assets/icons/volume-button.svg';
import { clamp, lerp } from '../../helpers/utils';

const Slider = memo(props => {
    const volume = props.volume;

    const handleDragStart = useCallback(() => {
        const handleMouseMove = e => {
          const startPos = e.screenX;
          const volume = store.getState().studio.volume;
          console.log("vol: " + volume);
          
          props.dispatch(setVolume(clamp(0, 1, (e.screenX - 15) / 165)));
        // props.dispatch(setVolume(Math.max(Number(e.target.value), 0)));

        }
        const handleDragStop = () => {
          // Only plays if the music was playing when handleDragStart was called
          
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

