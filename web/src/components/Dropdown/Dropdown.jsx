import React, { useState, useCallback, useMemo } from 'react';
import styles from './Dropdown.module.scss';


const Dropdown = (props) => {
  const [displayMenu, setDisplayMenu] = useState(false);

  const showDropdown = useCallback(() => {
    setDisplayMenu(true);
  }, [setDisplayMenu]);

  const hideDropdown = useCallback(() => {
    setDisplayMenu(false);
  }, [setDisplayMenu]);

  const menuItems = useMemo(() => props.items.map(item => (
    <li onClick={() => {
      item.action();
      setDisplayMenu(false);
    }}>
      <img className={styles.icon} src={item.icon} alt="dropdown item icon"></img><p>{item.name}</p>
    </li>
  )), [props.items]);

  return (
    <div className={styles.dropdown} onBlur={hideDropdown}>
      <div className={styles.button} onClick={showDropdown}>{props.title}</div>

      {displayMenu && <ul>
        {menuItems}
      </ul>}
    </div>
  );
};

export default Dropdown;
