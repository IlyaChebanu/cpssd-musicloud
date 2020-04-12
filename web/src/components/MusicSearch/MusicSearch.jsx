import React, { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import styles from './MusicSearch.module.scss';
import InputField from '../InputField';
import { ReactComponent as SortDuotoneIcon } from '../../assets/icons/sort-duotone.svg';
import { ReactComponent as SortUpIcon } from '../../assets/icons/sort-up-duotone.svg';

const MusicSearch = memo((props) => {
  const { className, setSortedBy } = props;
  const [sortPublished, setSortPublished] = useState('');
  const [sortDuration, setSortDuration] = useState('');
  const [sortTitle, setSortTitle] = useState('');
  const [sortArtist, setSortArtist] = useState('');
  const sorts = [sortPublished, sortDuration, sortTitle, sortArtist];
  const setSorts = [setSortPublished, setSortDuration, setSortTitle, setSortArtist];

  const toggle = useCallback((param, setParam, sortedBy) => {
    for (let i = 0; i < sorts.length; i += 1) {
      if (sorts[i] !== param) {
        setSorts[i]();
      }
    }
    if (param === 'up') {
      setParam('');
      setSortedBy(['', sortedBy]);
    } else if (param === 'down') {
      setParam('up');
      setSortedBy(['up', sortedBy]);
    } else {
      setParam('down');
      setSortedBy(['down', sortedBy]);
    }
  }, [setSortedBy, setSorts, sorts]);

  const switchIcon = useCallback((param) => {
    switch (param) {
      case 'up':
        return <SortUpIcon className={styles.sortIcon} />;
      case 'down':
        return <SortUpIcon style={{ transform: 'scale(1,-1)' }} className={styles.sortIcon} />;
      default:
        return <SortDuotoneIcon className={styles.sortIcon} />;
    }
  }, []);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <span className={styles.search}>
        <InputField onKeyPress={props.onKeyPress} onChange={props.onChange} name="search" placeholder="Search" />
      </span>
      <span className={`${styles.filters} ${styles.expanded}`}>
        <button
          type="button"
          onClick={() => toggle(sortPublished, setSortPublished, 'publish_sort')}
        >
          <p>Time published</p>
          {switchIcon(sortPublished)}
        </button>
        <button
          type="button"
          onClick={() => toggle(sortTitle, setSortTitle, 'title_sort')}
        >
          <p>Title</p>
          {switchIcon(sortTitle)}
        </button>
        {props.profile !== 'profile'
          ? (
            <button
              type="button"
              onClick={() => toggle(sortArtist, setSortArtist, 'artist_sort')}
            >
              <p>Artist</p>
              {switchIcon(sortArtist)}
            </button>
          )
          : null}
        <button
          type="button"
          onClick={() => toggle(sortDuration, setSortDuration, 'duration_sort')}
        >
          <p>Duration</p>
          {switchIcon(sortDuration)}
        </button>
      </span>
    </div>
  );
});

MusicSearch.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func,
  onKeyPress: PropTypes.func,
  setSortedBy: PropTypes.func,
  profile: PropTypes.string,
};

MusicSearch.defaultProps = {
  className: '',
  onChange: null,
  onKeyPress: null,
  setSortedBy: null,
  profile: '',
};

MusicSearch.displayName = 'MusicSearch';

export default MusicSearch;
