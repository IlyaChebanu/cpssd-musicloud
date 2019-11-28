/* eslint-disable react/no-array-index-key */
import React, { memo, useMemo } from 'react';
import styles from './Timeline.module.scss';
import Looper from '../Looper';

const Timeline = memo(() => {
  const ticks = useMemo(() => (
    [...Array(1000)].map((_, i) => <rect key={i} x={i * 40} y={24} className={styles.tick} />)
  ), []);

  const numbers = useMemo(() => (
    [...Array(1000)].map((_, i) => (
      <text key={i} x={i * 40 + 5} y={24} className={styles.nums}>{i + 1}</text>
    ))
  ), []);

  return (
    <div className={styles.wrapper}>
      <svg className={styles.ticks}>
        <rect y={29} className={styles.bottom} />
        {ticks}
        {numbers}
      </svg>
      <Looper />
    </div>
  );
});

Timeline.displayName = 'Timeline';

export default Timeline;
