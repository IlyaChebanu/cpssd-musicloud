/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, {
  memo, useState, useRef, useMemo, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Img from 'react-image';
import styles from './SongFeedCard.module.scss';
import ProfilePicture from '../../assets/profiler.jpg';
import CircularImage from '../CircularImage';
import CloudQuestion from '../../assets/cloud-question.jpg';
import Spinner from '../Spinner';
import { ReactComponent as LikeIcon } from '../../assets/icons/favorite-24px.svg';
import { ReactComponent as PlayIcon } from '../../assets/icons/play-circle-light.svg';
import { ReactComponent as PauseIcon } from '../../assets/icons/pause-circle-light.svg';
import { lerp } from '../../helpers/utils';

const SongFeedCard = memo(({
  className, username, time, title, url, likes, coverImage,
}) => {
  const [playerShowing, setPlayerShowing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [songDuration, setSongDuration] = useState(1);

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


  return (
    <div className={`${styles.wrapper} ${className}`}>
      <span className={styles.songFeedCard}>
        <span className={styles.postHeader}>
          <CircularImage src={ProfilePicture} className={styles.profiler} />
          <p className={styles.username}>{username}</p>
          <p className={styles.timestamp}>{`published ${moment(time).fromNow()}`}</p>
        </span>
        <div className={styles.content}>
          <Img src={[coverImage, CloudQuestion]} alt="song cover art" loader={<Spinner />} />
          <div className={styles.songInfo}>
            <div className={styles.textBlock}>
              <span>
                <p className={styles.title}>{title}</p>
                <LikeIcon />
                <p className={styles.timestamp}>{`${likes} likes`}</p>
              </span>
              <p className={styles.description}>Song description</p>
            </div>
            <div className={styles.playbackControl}>
              {loading
                ? <Spinner className={styles.playPause} />
                : playing
                  ? <PauseIcon className={styles.playPause} onClick={pauseAudio} />
                  : <PlayIcon className={styles.playPause} onClick={playAudio} />}
              <div className={styles.progressBar} onMouseDown={songSeekStart} role="navigation">
                <div className={styles.progressBarInner} style={progressStyle} />
              </div>
              <p className={styles.currentTime}>{moment.utc(currentTime * 1000).format('mm:ss')}</p>
            </div>
            {playerShowing && audioPlayer}
          </div>
        </div>
      </span>
    </div>
  );
});

SongFeedCard.propTypes = {
  className: PropTypes.string,
  username: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  likes: PropTypes.number.isRequired,
  coverImage: PropTypes.string.isRequired,
};

SongFeedCard.defaultProps = {
  className: '',
};

SongFeedCard.displayName = 'SongFeedCard';

export default SongFeedCard;
