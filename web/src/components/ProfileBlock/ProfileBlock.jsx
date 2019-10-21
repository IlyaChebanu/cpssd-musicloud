import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './ProfileBlock.module.scss';
import InputField from '../InputField';
import { ReactComponent as LikeIcon } from '../../assets/icons/favorite-24px.svg';
import { ReactComponent as SortDuotoneIcon } from '../../assets/icons/sort-duotone.svg';
import { ReactComponent as SortUpDuotoneIcon } from '../../assets/icons/sort-up-duotone.svg';
import SubmitButton from '../../components/SubmitButton';

// TODO: Connect to redux

const ProfileBlock = props => {


  return (
      
    <div className={styles.wrapper + (props.className ? ` ${props.className}` : '')}>
        <div className={styles.topWrapper}>
            <span className={styles.profilePicture}>
            </span>
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <Link className={styles.num}>300</Link>
                    <p className={styles.class}>followers</p>
                </div>
                <div className={styles.stat}>
                    <Link className={styles.num}>234</Link>
                    <p className={styles.class}>following</p>
                </div>
                <div className={styles.stat}>
                    <Link className={styles.num}>16</Link>
                    <p className={styles.class}>songs</p>
                </div>
                <div className={styles.stat}>
                    <Link className={styles.num}>12</Link>
                    <p className={styles.class}>posts</p>
                </div>
                <div className={styles.stat}>
                    <Link className={styles.num}>266</Link>
                    <p className={styles.class}>likes</p>
                </div>  
            </div>   
        <SubmitButton className={styles.followButton} text='Settings'/>
        </div>
        
        <div>
            <p className={styles.username}>Napstalgic</p>
        </div>

    </div>
  );
};

ProfileBlock.propTypes = {
  className: PropTypes.string
};

export default ProfileBlock;

