import React, { memo, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setVolume } from '../../actions/studioActions';
import styles from './Slider.module.scss';
import { ReactComponent as Volume } from '../../assets/icons/volume.svg';
import { ReactComponent as VolumeIndicator } from '../../assets/icons/volume-button.svg';
import { clamp, lerp } from '../../helpers/utils';

const Slider = memo((props) => {
  const { volume, dispatch } = props;

  const handleDragStart = useCallback((ev) => {
    const initialMousePos = ev.screenX;
    const initialVolume = volume;
    const handleMouseMove = (e) => {
      dispatch(setVolume(clamp(0, 1, initialVolume + (e.screenX - initialMousePos) / 165)));
    };
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [dispatch, volume]);

  const iconStyle = useMemo(() => {
    const pos = lerp(15, 180, volume);
    return {
      transform: `translate(${pos}px, -0px)`,
    };
  }, [volume]);

  return (
    <div className={styles.wrapper}>
      <VolumeIndicator style={iconStyle} onMouseDown={handleDragStart} />
      <Volume />
    </div>
  );
});

Slider.propTypes = {
  volume: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
};

Slider.displayName = 'Slider';

const mapStateToProps = ({ studio }) => ({
  volume: studio.volume,
});

export default connect(mapStateToProps)(Slider);
