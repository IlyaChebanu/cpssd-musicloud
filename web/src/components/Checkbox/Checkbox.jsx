import React, { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Checkbox.module.scss';

const Checkbox = memo(props => {
  const { onChange } = props;

  const [checked, setChecked] = useState(Boolean(props.value));

  const handleChange = useCallback(e => {
      setChecked(e.target.checked);
      onChange && onChange(e.target.checked);
  }, [onChange]);

  return (
    <label className={styles.container + (props.className ? ` ${props.className}` : '')}>
      {props.children}
      <input type='checkbox' onChange={handleChange} checked={checked}/>
      <span className={styles.checkmark}/>
    </label>
  );
});

Checkbox.propTypes = {
  children: PropTypes.node,
  onChange: PropTypes.func,
  value: PropTypes.bool,
  className: PropTypes.string
};

export default Checkbox;

