/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
import React, {
  memo, useState, useCallback, useMemo, useRef,
} from 'react';
import PropTypes from 'prop-types';
import Img from 'react-image';
import styles from './SongCard.module.scss';
import { ReactComponent as PlayIcon } from '../../assets/icons/play-circle-light.svg';
import { ReactComponent as PauseIcon } from '../../assets/icons/pause-circle-light.svg';
import CircularImage from '../CircularImage';
import CloudQuestion from '../../assets/cloud-question.jpg';
import { ReactComponent as LikeIcon } from '../../assets/icons/favorite-24px.svg';
import { unlikeSong, likeSong } from '../../helpers/api';
import Spinner from '../Spinner';
import { lerp } from '../../helpers/utils';

const SongCard = memo((props) => {
  const {
    className, id, isLiked, coverImage, url, likes, title, username, profileImg,
  } = props;

  const [songLiked, setSongLiked] = useState(isLiked);

  const [playerShowing, setPlayerShowing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [songDuration, setSongDuration] = useState(1);

  const [coverHover, setCoverHover] = useState(false);

  const playerRef = useRef();

  const audioPlayer = useMemo(() => (
    <audio
      src={url}
      onCanPlay={() => {
        setLoading(false);
        setPlaying(true);
        playerRef.current.play();
        setSongDuration(playerRef.current.duration);
      }}
      onTimeUpdate={(e) => {
        setCurrentTime(e.target.currentTime);
      }}
      ref={playerRef}
    />
  ), [url]);

  const playAudio = useCallback(() => {
    if (!playerRef.current) {
      setPlayerShowing(true);
      setLoading(true);
    } else {
      setPlaying(true);
      playerRef.current.play();
    }
  }, [playerRef]);

  const pauseAudio = useCallback(() => {
    setPlaying(false);
    playerRef.current.pause();
  }, [playerRef]);

  const progressStyle = useMemo(() => ({
    width: `${(currentTime / songDuration) * 100}%`,
  }), [currentTime, songDuration]);

  const songSeekStart = useCallback((ev) => {
    const bb = ev.target.getBoundingClientRect();
    const xMin = bb.x;
    const xMax = bb.x + bb.width;
    if (!playerRef.current) {
      setPlayerShowing(true);
      setLoading(true);
    } else {
      const newTime = lerp(0, playerRef.current.duration, (ev.clientX - xMin) / (xMax - xMin));
      playerRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
    const handleMouseMove = (e) => {
      e.preventDefault();
      if (playerRef.current) {
        const newCurrentTime = lerp(
          0,
          playerRef.current.duration,
          (e.clientX - xMin) / (xMax - xMin),
        );
        playerRef.current.currentTime = newCurrentTime;
        setCurrentTime(newCurrentTime);
      }
    };
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, []);

  const handleLikeSong = useCallback(() => {
    (async () => {
      if (songLiked) {
        setSongLiked(false);
        const res = await unlikeSong(id);
        if (res.status !== 200) {
          setSongLiked(true);
        }
      } else {
        setSongLiked(true);
        const res = await likeSong(id);
        if (res.status !== 200) {
          setSongLiked(false);
        }
      }
    })();
  }, [id, songLiked]);

  const coverEnter = useCallback(() => {
    setCoverHover(true);
  }, []);

  const coverLeave = useCallback(() => {
    setCoverHover(false);
  }, []);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.thumbWrapper}>
        <div className={styles.thumbWrapper} onMouseEnter={coverEnter} onMouseLeave={coverLeave}>
          <Img src={[coverImage, CloudQuestion]} alt="song cover art" loader={<Spinner />} />
          <div className={styles.playbackControls}>
            {loading
              ? <Spinner className={styles.playPause} />
              : playing
                ? <PauseIcon className={styles.playPause} onClick={pauseAudio} />
                : <PlayIcon className={styles.playPause} onClick={playAudio} />}
          </div>
        </div>
      </div>
      <div className={styles.details}>
        <p className={styles.title}>{title}</p>
        <span>
          <CircularImage className={styles.profilePic} src={profileImg} />
          <p className={styles.username}>{username}</p>
        </span>
        <div className={styles.likesWrapper}>
          <div className={styles.likeIconWrapper}>
            <LikeIcon className={styles.likeIcon} onClick={handleLikeSong} />
            <LikeIcon className={`${styles.likeIcon} ${styles.gradient} ${songLiked ? styles.liked : ''}`} />
          </div>
          <p className={styles.likes}>{`${songLiked ? likes + 1 : likes}`}</p>
        </div>
        {playerShowing && audioPlayer}
      </div>
    </div>
  );
});

SongCard.propTypes = {
  className: PropTypes.string,
  id: PropTypes.number.isRequired,
  isLiked: PropTypes.bool,
  coverImage: PropTypes.string,
  url: PropTypes.string,
  likes: PropTypes.number,
  title: PropTypes.string,
  username: PropTypes.string,
  profileImg: PropTypes.string,
};

SongCard.defaultProps = {
  className: '',
  isLiked: false,
  coverImage: null,
  url: '',
  likes: null,
  title: '',
  username: '',
  profileImg: null,

};

SongCard.displayName = 'SongCard';

export default SongCard;
