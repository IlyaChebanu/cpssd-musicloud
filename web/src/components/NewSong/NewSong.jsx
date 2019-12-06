import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './NewSong.module.scss';
import PlusCircle from '../../assets/icons/plus-circle-light.svg';

const NewSong = memo((props) => {
  const { className, onClick } = props;
  return (
    <div onClick={onClick} className={`${styles.wrapper} ${className}`} role="button" tabIndex={0}>
      <div className={styles.thumbWrapper}>
        <img alt="song cover art" className={styles.thumbnail} src={PlusCircle} />
        <p>New Song</p>
      </div>
    </div>
  );
});

NewSong.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

NewSong.defaultProps = {
  className: '',
};

NewSong.displayName = 'NewSong';

export default NewSong;
