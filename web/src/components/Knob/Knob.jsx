import React, {
  memo, useRef, useState, useMemo, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { useGlobalEvent, useMouseEvents } from 'beautiful-react-hooks';
import styles from './Knob.module.scss';
import { ReactComponent as KnobIcon } from '../../assets/icons/Knob.svg';
import { clamp, lerp, toNormalRange } from '../../helpers/utils';

const Knob = memo(({
  className, name, sensitivity, value, onChange, min, max,
}) => {
  const [val, setVal] = useState(value);
  const [startValue, setStartValue] = useState(value);
  const [startCoord, setStartCoord] = useState({});
  const [moving, setMoving] = useState(false);
  const ref = useRef();
  const { onMouseDown } = useMouseEvents(ref);
  const onMouseMove = useGlobalEvent('mousemove');
  const onMouseUp = useGlobalEvent('mouseup');

  useEffect(() => {
    setVal(value);
  }, [value]);

  onMouseDown((e) => {
    e.preventDefault();
    setMoving(true);
    setStartCoord(e.clientY);
    setStartValue(val);
  });

  onMouseMove((e) => {
    if (moving) {
      e.preventDefault();
      const newVal = clamp(
        min,
        max,
        startValue - (e.clientY - startCoord) / ((100 * sensitivity) / (max - min)),
      );
      if (onChange) {
        onChange(newVal);
      } else {
        setVal(newVal);
      }
    }
  });

  onMouseUp(() => {
    setMoving(false);
  });

  const rotationStyle = useMemo(() => ({
    transform: `rotate(${lerp(-140, 140, lerp(0, 1, toNormalRange(min, max, val)))}deg)`,
  }), [max, min, val]);

  return (
    <span className={`${styles.knob} ${className}`}>
      <KnobIcon
        ref={ref}
        style={rotationStyle}
      />
      <p>{name}</p>
    </span>
  );
});

Knob.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string,
  sensitivity: PropTypes.number,
  value: PropTypes.number,
  onChange: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
};

Knob.defaultProps = {
  className: '',
  name: '',
  sensitivity: 1,
  value: 0,
  onChange: null,
  min: 0,
  max: 1,
};

Knob.displayName = 'Knob';

export default Knob;
