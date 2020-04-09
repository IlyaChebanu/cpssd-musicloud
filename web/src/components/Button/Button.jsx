import React, { memo } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import styles from './Button.module.scss';

const Button = memo(({
  className, children, onClick, dataTip,
}) => (
  // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
  <button
    className={`${styles.button} ${className}`}
    type="button"
    data-tip={dataTip}
    data-place="right"
    data-for="tooltip"
    onClick={onClick}
    onMouseOver={ReactTooltip.rebuild}
  >
    {children}
  </button>
));

Button.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  dataTip: PropTypes.string,
};

Button.defaultProps = {
  className: '',
  dataTip: '',
};

Button.displayName = 'Button';

export default Button;
