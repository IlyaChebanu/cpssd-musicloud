import React, { useCallback, useState, useMemo, memo } from 'react'
import PropTypes from 'prop-types'
import styles from './InputField.module.scss';

const InputField = memo(props => {
  const [value, setValue] = useState(props.value || '');
  const [hover, setHover] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setHover(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHover(false);
  }, []);

  const handleChange = useCallback(e => {
    setValue(e.target.value);
    props.onChange && props.onChange(e.target.value);
  }, [props.onChange]);

  const borderStyle = useMemo(() => ({
    borderBottomColor: props.borderColour ? props.borderColour : 'white'
  }), [props.borderColour]);

  const sideContentStyle = useMemo(() => ({
    ...borderStyle,
    paddingLeft: props.sideContent ? hover ? '25px' : '10px' : '0'
  }), [borderStyle, props.sideContent, hover]);

  return (
    <div
      className={styles.wrapper + (hover ? ` ${styles.hover}` : '')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <input
        className={styles.input}
        type={props.password ? 'password' : 'text'}
        name={props.name} placeholder={props.placeholder}
        onChange={handleChange}
        value={value}
        style={borderStyle}
      />
      <span className={styles.sideContent} style={sideContentStyle}>
        {props.sideContent}
      </span>
    </div>
  );
});

InputField.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  password: PropTypes.bool,
  sideContent: PropTypes.node
}

export default InputField

