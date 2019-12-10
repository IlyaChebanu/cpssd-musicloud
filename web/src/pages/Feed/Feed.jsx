import React, {
  memo, useState, useEffect, useMemo, useCallback,
} from 'react';
import { connect } from 'react-redux';
import styles from './Feed.module.scss';
import Header from '../../components/Header';
import { useUpdateUserDetails } from '../../helpers/hooks';
import { getTimeline } from '../../helpers/api';
import Spinner from '../../components/Spinner';
import PostCard from '../../components/PostCard';
import SongFeedCard from '../../components/SongFeedCard';
import AddPost from '../../components/AddPost/AddPost';

function Feed() {
  useUpdateUserDetails();

  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshFeed = useCallback(async () => {
    setLoading(true);
    const res = await getTimeline();
    setLoading(false);
    if (res.status === 200) {
      setFeedItems(res.data.timeline);
    }
  }, []);

  useEffect(() => {
    refreshFeed();
  }, [refreshFeed]);

  const renderableItems = useMemo(() => feedItems.map((feedItem) => {
    if (feedItem.type === 'post') {
      return (
        <PostCard
          message={feedItem.message}
          username={feedItem.username}
          time={feedItem.created}
          profileImg={feedItem.profiler}
        />
      );
    }
    if (feedItem.type === 'song') {
      return (
        <SongFeedCard
          time={feedItem.created}
          username={feedItem.username}
          title={feedItem.title}
          url={feedItem.url}
          description={feedItem.description}
          duration={feedItem.duration}
          likes={feedItem.likes}
          coverImage={feedItem.cover}
          isLiked={Boolean(feedItem.like_status)}
          id={feedItem.sid}
          profileImg={feedItem.profiler}
        />
      );
    }
    return null;
  }), [feedItems]);

  return (
    <div className={styles.wrapper}>
      <Header selected={1} />
      <div className={styles.contentWrapper}>
        <AddPost onSubmit={refreshFeed} placeholder="Write something" />
        {loading ? <Spinner className={styles.spinner} /> : renderableItems}
      </div>
    </div>
  );
}

export default connect()(memo(Feed));
