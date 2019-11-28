import React, {
  useCallback, useState, useMemo, memo,
} from 'react';
import PropTypes from 'prop-types';
import styles from './InputField.module.scss';

const InputField = memo((props) => {
  const { onChange, borderColour, sideContent } = props;

  const [value, setValue] = useState(props.value);
  const [hover, setHover] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setHover(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHover(false);
  }, []);

  const handleChange = useCallback((e) => {
    setValue(e.target.value);
    onChange(e.target.value);
  }, [onChange]);

  const borderStyle = useMemo(() => ({
    borderBottomColor: borderColour,
  }), [borderColour]);

  const sideContentStyle = useMemo(() => {
    let paddingLeft = '0';
    if (sideContent) {
      paddingLeft = hover ? '25px' : '10px';
    }
    return {
      ...borderStyle,
      paddingLeft,
    };
  }, [borderStyle, sideContent, hover]);

  return (
    <div
      className={styles.wrapper + (hover && props.animate ? ` ${styles.hover}` : '')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <input
        className={`${styles.input} ${props.className}`}
        type={props.password ? 'password' : 'text'}
        name={props.name}
        placeholder={props.placeholder}
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
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string.isRequired,
  password: PropTypes.bool,
  sideContent: PropTypes.node,
  className: PropTypes.string,
  animate: PropTypes.bool,
  borderColour: PropTypes.string,
};

InputField.defaultProps = {
  value: '',
  borderColour: 'white',
  password: false,
  onChange: () => {},
  sideContent: null,
  className: '',
  animate: false,
};

export default InputField;
