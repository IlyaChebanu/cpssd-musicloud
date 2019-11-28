import React, { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import styles from './MusicSearch.module.scss';
import InputField from '../InputField';
import { ReactComponent as SortIcon } from '../../assets/icons/sort-alt-light.svg';
import { ReactComponent as SortDuotoneIcon } from '../../assets/icons/sort-duotone.svg';
// import { ReactComponent as SortUpDuotoneIcon } from '../../assets/icons/sort-up-duotone.svg';

const MusicSearch = memo((props) => {
  const { className } = props;

  const [expanded, setExpanded] = useState(false);
  const toggleExplanded = useCallback(() => setExpanded(!expanded), [expanded]);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <span className={styles.search}>
        <InputField name="search" placeholder="Search" />
        <button type="button" onClick={toggleExplanded}>
          <SortIcon className={styles.sortIcon} />
        </button>
      </span>
      <span className={styles.filters + (expanded ? ` ${styles.expanded}` : '')}>
        <button type="button">
          <p>Time published</p>
          <SortDuotoneIcon className={styles.sortIcon} />
        </button>
        <button type="button">
          <p>Title</p>
          <SortDuotoneIcon className={styles.sortIcon} />
        </button>
        <button type="button">
          <p>Artist</p>
          <SortDuotoneIcon className={styles.sortIcon} />
        </button>
        <button type="button">
          <p>Duration</p>
          <SortDuotoneIcon className={styles.sortIcon} />
        </button>
      </span>
    </div>
  );
});

MusicSearch.propTypes = {
  className: PropTypes.string,
};

MusicSearch.defaultProps = {
  className: '',
};

MusicSearch.displayName = 'MusicSearch';

export default MusicSearch;
