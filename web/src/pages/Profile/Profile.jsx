import React, { memo, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './Profile.module.scss';
import Header from '../../components/Header';
import SongCard from '../../components/SongCard';
import PostCard from '../../components/PostCard/PostCard';
import ProfileBlock from '../../components/ProfileBlock';
import AddPost from '../../components/AddPost';
import { useUpdateUserDetails } from '../../helpers/hooks';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getCompiledSongs } from "../../helpers/api";
import OwnSongCard from "../../components/OwnSongCard";
import Spinner from "../../components/Spinner";
import { hideSongPicker, setSongId, setSongName } from "../../actions/studioActions";


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
  const { dispatch, user, history, selected } = props;
  let url = new URL(window.location.href);
  let username = url.searchParams.get("username");

  const [gotSongs, setGotSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getSongs = async () => {
      setLoading(true);
      const res = await getCompiledSongs(username);
      setLoading(false);
      if (res.status === 200) {
        setGotSongs(res.data.songs);
      }
    };
    getSongs();
  }, [dispatch, username, selected]);


  const ownSongCards = useMemo(() => gotSongs.map((song) => (
    <OwnSongCard
      key={song.sid}
      songName={`${song.title}`}
      className={styles.songCard}
      onClick={() => {
        if(username === user.username) {
            dispatch(setSongName(song.title));
            dispatch(setSongId(song.sid));
            dispatch(hideSongPicker());
            history.push("/studio");
        } else {
            return false;
        }
      }}
      imageSrc={song.cover}
    />
  )), [dispatch, gotSongs, history]);


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
          {loading ? <Spinner /> : ownSongCards}
        </div>
        <Link to="." className={styles.link}>See more</Link>
      </div>

      {/* Blogs section */}

      <div className={styles.contentWrapper}>
        <title className={styles.sectionTitle}>Posts</title>
          {username === user.username ? <AddPost /> : <div/>}
        <div className={styles.blogs}>
          {blogCards}
          <Link to="." className={styles.link}>See more</Link>
        </div>
      </div>
    </div>
  );
});

Profile.propTypes = {
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
};

Profile.displayName = 'Profile';

const mapStateToProps = ({ user }) => ({ user });

export default connect(mapStateToProps)(Profile);