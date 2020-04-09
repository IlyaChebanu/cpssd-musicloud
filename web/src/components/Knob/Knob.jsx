import React, {
  memo, useRef, useState, useMemo, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { useGlobalEvent, useMouseEvents } from 'beautiful-react-hooks';
import ReactTooltip from 'react-tooltip';
import styles from './Knob.module.scss';
import { ReactComponent as KnobIcon } from '../../assets/icons/Knob.svg';
import {
  clamp, lerp, toNormalRange, genId,
} from '../../helpers/utils';


const Knob = memo(({
  className, name, sensitivity, value, onChange, min, max, dataTip,
}) => {
  const [val, setVal] = useState(value);
  const [startValue, setStartValue] = useState(value);
  const [startCoord, setStartCoord] = useState({});
  const [moving, setMoving] = useState(false);
  const ref = useRef();
  const [percentage, setPercentage] = useState((startValue / 1) * 100);
  const { onMouseDown } = useMouseEvents(ref);
  const onMouseMove = useGlobalEvent('mousemove');
  const onMouseUp = useGlobalEvent('mouseup');
  useEffect(() => {
    setVal(value);
  }, [value]);

  onMouseDown((e) => {
    e.preventDefault();
    e.stopPropagation();
    setMoving(true);
    setStartCoord(e.clientY);
    if (startValue !== val) {
      setStartValue(val);
    }
  });

  onMouseMove((e) => {
    if (moving) {
      ReactTooltip.show(ref.current);
      const newVal = clamp(
        min,
        max,
        startValue - (e.clientY - startCoord) / ((100 * sensitivity) / (max - min)),
      );
      setPercentage(Math.floor(newVal * 100));
      if (onChange) {
        onChange(newVal);
      } else {
        setVal(newVal);
      }
    }
  });

  onMouseUp((e) => {
    if (moving) {
      e.preventDefault();
      e.stopPropagation();
      setMoving(false);
      ReactTooltip.hide(ref.current);
      ReactTooltip.rebuild();
    }
  });

  const rotationStyle = useMemo(() => ({
    transform: `rotate(${lerp(-140, 140, lerp(0, 1, toNormalRange(min, max, val)))}deg)`,
  }), [max, min, val]);

  const knob = useMemo(() => {
    const id = genId();
    return (
      <span
        className={`${styles.knob} ${className}`}
        data-tip={!moving ? dataTip : percentage}
        data-place="right"
        data-delay-show={moving ? 0 : 500}
        data-delay-hide={moving ? 0 : 0}
        data-for={id}
        ref={(r) => { ref.current = r; }}
        role="button"
        tabIndex={0}
      >
        <KnobIcon
          onClick={() => { ReactTooltip.hide(ref.current); ReactTooltip.rebuild(); }}
          ref={ref}
          style={rotationStyle}
        />
        <p>{name}</p>
        <ReactTooltip id={id} />
      </span>
    );
  }, [className, dataTip, moving, name, percentage, rotationStyle]);

  return (
    knob
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
  dataTip: PropTypes.string,
};

Knob.defaultProps = {
  className: '',
  name: '',
  sensitivity: 1,
  value: 0,
  onChange: null,
  min: 0,
  max: 1,
  dataTip: '',
};

Knob.displayName = 'Knob';

export default Knob;
