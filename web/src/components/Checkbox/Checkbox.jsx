import React, { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Checkbox.module.scss';

const Checkbox = memo((props) => {
  const {
    onChange, className, value, children,
  } = props;

  const [checked, setChecked] = useState(Boolean(value));

  const handleChange = useCallback((e) => {
    setChecked(e.target.checked);
    if (onChange) onChange(e.target.checked);
  }, [onChange]);

  return (
    <label className={`${styles.container} ${className}`}>
      {children}
      <input type="checkbox" onChange={handleChange} checked={checked} />
      <span className={styles.checkmark} />
    </label>
  );
});

Checkbox.propTypes = {
  children: PropTypes.node.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.bool.isRequired,
  className: PropTypes.string,
};

Checkbox.defaultProps = {
  className: '',
};

export default Checkbox;
