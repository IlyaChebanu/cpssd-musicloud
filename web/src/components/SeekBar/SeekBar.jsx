import React, { memo, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './SeekBar.module.scss';
import { ReactComponent as SeekBarSvg } from '../../assets/seekbar.svg';
import { connect } from 'react-redux';

const SeekBar = memo(props => {
  const currentBeat = props.currentBeat;
  const scroll = props.scroll;
  const iconStyle = useMemo(() => {
    const pos = -7 + 220 + (currentBeat - 1) * 40 - scroll;
    return {
      transform: `translate(${pos}px, -0px)`,
      opacity: pos >= 213 ? 1 : 0,
    };
  }, [currentBeat, scroll]);
  const barStyle = useMemo(() => {
    const pos = 220 + (currentBeat - 1) * 40 - scroll;
    return {
      transform: `translate(${pos}px, 60px)`,
      opacity: pos >= 220 ? 1 : 0,
    };
  }, [currentBeat, scroll]);

  return (
    <div className={styles.wrapper}>
      <SeekBarSvg style={iconStyle} />
      <div className={styles.bar} style={barStyle}/>
    </div>
  );
});

SeekBar.propTypes = {

};

const mapStateToProps = ({ studio }) => ({
  currentBeat: studio.currentBeat,
  scroll: studio.scroll
});

export default connect(mapStateToProps)(SeekBar);

