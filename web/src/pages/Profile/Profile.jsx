import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import styles from './Profile.module.scss';
import Header from '../../components/Header';
import SongCard from '../../components/SongCard';
import PostCard from '../../components/PostCard/PostCard';
import ProfileBlock from '../../components/ProfileBlock';
import AddPost from '../../components/AddPost';
import { useUpdateUserDetails } from '../../helpers/hooks';
import store from '../../store';


const blogCards = [];
for (let i = 0; i < 3; i += 1) {
  blogCards.push(<PostCard className={styles.blogCard} />);
}

const songCards = [];
for (let i = 0; i < 4; i += 1) {
  songCards.push(<SongCard className={styles.songCard} />);
}

const Profile = memo((props) => {
  useUpdateUserDetails();
  const state = store.getState();
  let url = new URL(window.location.href);
  let username = url.searchParams.get("username");

  return (
    <div className={styles.wrapper}>
      <Header selected={2} />
      {/* Songs section */}
      <div className={styles.contentWrapper}>
        <ProfileBlock />
      </div>
      <div className={styles.contentWrapper}>
        <title className={styles.sectionTitle}>Songs</title>
        <div className={styles.songs}>
          {songCards}
        </div>
        <Link to="." className={styles.link}>See more</Link>
      </div>

      {/* Blogs section */}

      <div className={styles.contentWrapper}>
        <title className={styles.sectionTitle}>Posts</title>
          {username === state.user.username ? <AddPost /> : <div/>}
        <div className={styles.blogs}>
          {blogCards}
          <Link to="." className={styles.link}>See more</Link>
        </div>
      </div>
    </div>
  );
});

Profile.displayName = 'Profile';

export default Profile;
