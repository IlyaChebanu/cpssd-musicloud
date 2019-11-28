import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../Profile/Profile.module.scss';
import Header from '../../components/Header';
import MusicSearch from '../../components/MusicSearch';
import SongCard from '../../components/SongCard';
import PostCard from '../../components/PostCard/PostCard'
import ProfileBlock from '../../components/ProfileBlock'
import AddPost from '../../components/AddPost'
import { useUpdateUserDetails } from '../../helpers/utils';

const blogCards = [];
for (let i = 0; i < 3; i++) {
  blogCards.push(<PostCard className={styles.blogCard}/>);
}

const songCards = [];
for (let i = 0; i < 4; i++) {
  songCards.push(<SongCard className={styles.songCard}/>);
}

const Profile = props => {
  useUpdateUserDetails();

  return (
    <div className={styles.wrapper}>
      <Header selected={2}/>
      {/* Songs section */}
      <div className={styles.contentWrapper}>
      <ProfileBlock />
      </div>
      <div className={styles.contentWrapper}>
        <title className={styles.sectionTitle}>Songs</title>
        <div className={styles.songs}>
          {songCards}
        </div>
        <Link to='.' className={styles.link}>See more</Link>
      </div>

      {/* Blogs section */}

      <div className={styles.contentWrapper}>
      <title className={styles.sectionTitle}>Posts</title>
      <AddPost/>
        <div className={styles.blogs}>
          {blogCards}
        <Link to='.' className={styles.link}>See more</Link>
        </div>
      </div>
    </div>
  );
};

Profile.propTypes = {

};

export default Profile;