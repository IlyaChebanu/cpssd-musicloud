import React, { memo, useMemo } from 'react';
import styles from './Timeline.module.scss';
import Looper from '../Looper';

const Timeline = memo(props => {

  const ticks = useMemo(() => {
    return [...Array(1000)].map((_, i) => {
      return <rect key={i} x={i * 40} y={24} className={styles.tick}></rect>
    });
  }, []);

  const numbers = useMemo(() => {
    return [...Array(1000)].map((_, i) => {
      return <text key={i} x={i * 40 + 5} y={24} className={styles.nums}>{i + 1}</text>
    });
  }, []);

  return (
    <div className={styles.wrapper}>
      <svg className={styles.ticks}>
        <rect y={29} className={styles.bottom}></rect>
        {ticks}
        {numbers}
      </svg>
      <Looper />
    </div>
  );
});

export default Timeline;

