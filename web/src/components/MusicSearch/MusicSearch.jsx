import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './MusicSearch.module.scss';
import InputField from '../InputField';
import { ReactComponent as SortIcon } from '../../assets/icons/sort-alt-light.svg';
import { ReactComponent as SortDuotoneIcon } from '../../assets/icons/sort-duotone.svg';
import { ReactComponent as SortUpDuotoneIcon } from '../../assets/icons/sort-up-duotone.svg';

// TODO: Connect to redux

const MusicSearch = props => {
  const [expanded, setExpanded] = useState(false);
  const toggleExplanded = useCallback(() => setExpanded(!expanded), [expanded]);

  return (
    <div className={styles.wrapper + (props.className ? ` ${props.className}` : '')}>
      <span className={styles.search}>
        <InputField name="search" placeholder="Search"/>
        <button onClick={toggleExplanded}>
          <SortIcon className={styles.sortIcon}/>
        </button>
      </span>
      <span className={styles.filters + (expanded ? ` ${styles.expanded}` : '')}>
        <button>
          <p>Time published</p>
          <SortDuotoneIcon className={styles.sortIcon}/>
        </button>
        <button>
          <p>Title</p>
          <SortDuotoneIcon className={styles.sortIcon}/>
        </button>
        <button>
          <p>Artist</p>
          <SortDuotoneIcon className={styles.sortIcon}/>
        </button>
        <button>
          <p>Duration</p>
          <SortDuotoneIcon className={styles.sortIcon}/>
        </button>
      </span>
    </div>
  );
};

MusicSearch.propTypes = {
  className: PropTypes.string
};

export default MusicSearch;

