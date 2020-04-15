/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, {
  useState, useCallback, useMemo, memo,
} from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import styles from './Dropdown.module.scss';

const Dropdown = memo((props) => {
  const { items, title, gridSize } = props;
  const [displayMenu, setDisplayMenu] = useState(false);

  const showDropdown = useCallback((e) => {
    e.preventDefault();
    setDisplayMenu(true);
  }, [setDisplayMenu]);

  const hideDropdown = useCallback((e) => {
    ReactTooltip.hide();
    e.preventDefault();
    setDisplayMenu(false);
  }, [setDisplayMenu]);

  const menuItems = useMemo(() => items.map((item) => (
    <li
      className={gridSize === item.size ? styles.liSelected : ''}
      data-tip={item.dataTip}
      data-for="tooltip"
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
  )), [gridSize, items]);

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


Dropdown.displayName = 'Dropdown';

Dropdown.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.node.isRequired,
  gridSize: PropTypes.node.isRequired,
};

const mapStateToProps = ({ studio }) => ({
  gridSize: studio.gridSize,
});


export default connect(mapStateToProps)(Dropdown);
