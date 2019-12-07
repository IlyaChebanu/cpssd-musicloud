import React, {
  useState, useCallback, useMemo, memo,
} from 'react';
import PropTypes from 'prop-types';
import styles from './Dropdown.module.scss';


const Dropdown = memo((props) => {
  const { items, title } = props;
  const [displayMenu, setDisplayMenu] = useState(false);

  const showDropdown = useCallback(() => {
    setDisplayMenu(true);
  }, [setDisplayMenu]);

  const hideDropdown = useCallback(() => {
    setDisplayMenu(false);
  }, [setDisplayMenu]);

  const menuItems = useMemo(() => items.map((item) => (
    <li
      key={item.name}
      onMouseDown={() => {
        if (item.action) item.action();
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
  title: PropTypes.string.isRequired,
};

Dropdown.displayName = 'Dropdown';

export default Dropdown;
