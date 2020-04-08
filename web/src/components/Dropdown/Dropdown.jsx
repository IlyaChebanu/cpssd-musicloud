/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, {
  useState, useCallback, useMemo, memo,
} from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import styles from './Dropdown.module.scss';

const Dropdown = memo((props) => {
  const { items, title } = props;
  const [displayMenu, setDisplayMenu] = useState(false);

  const showDropdown = useCallback((e) => {
    e.preventDefault();
    setDisplayMenu(true);
  }, [setDisplayMenu]);

  const hideDropdown = useCallback((e) => {
    e.preventDefault();
    setDisplayMenu(false);
  }, [setDisplayMenu]);

  const menuItems = useMemo(() => items.map((item) => (
    <li
      style={{ zIndex: 1 }}
      data-tip={item.dataTip}
      data-place="right"
      key={item.name}
      onMouseOver={ReactTooltip.rebuild}
      onMouseDown={() => {
        if (item.action) item.action();
        ReactTooltip.hide();
        setDisplayMenu(false);
      }}
    >
      {item.icon && <img className={styles.icon} src={item.icon} alt="dropdown item icon" />}
      <p>{item.name}</p>

    </li>
  )), [items]);

  return (
    <div className={styles.dropdown} onBlur={hideDropdown}>
      <div className={styles.button} onClick={showDropdown} role="button" tabIndex={0}>{title}</div>

      {displayMenu && (
      <ul>
        {menuItems}
      </ul>
      )}

    </div>
  );
});

Dropdown.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.node.isRequired,
};

Dropdown.displayName = 'Dropdown';

export default Dropdown;
