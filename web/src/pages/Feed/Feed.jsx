import React, {
  memo, useState, useEffect, useMemo, useCallback,
} from 'react';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from './Feed.module.scss';
import Header from '../../components/Header';
import { useUpdateUserDetails } from '../../helpers/hooks';
import { getNextTimeline, getTimeline } from '../../helpers/api';
import Spinner from '../../components/Spinner';
import PostCard from '../../components/PostCard';
import SongFeedCard from '../../components/SongFeedCard';
import AddPost from '../../components/AddPost/AddPost';

function Feed() {
  useUpdateUserDetails();

  const [feedItems, setFeedItems] = useState([]);
  const [gotNextFeedItems, setNextFeedItems] = useState('');

  const refreshFeed = useCallback(async () => {
    const res = await getTimeline();
    if (res.status === 200) {
      setFeedItems(res.data.timeline);
      if (res.data.next_page) {
        setNextFeedItems(res.data.next_page);
      }
    }
  }, []);

  const nextFeedItems = useCallback(async () => {
    const res = await getNextTimeline(gotNextFeedItems);
    if (res.status === 200) {
      setFeedItems([...feedItems, ...res.data.timeline]);
      if (res.data.next_page) {
        setNextFeedItems(res.data.next_page);
      } else {
        setNextFeedItems('');
      }
    }
  }, [feedItems, gotNextFeedItems]);

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
          key={feedItem.username + feedItem.created}
        />
      );
    }
    if (feedItem.type === 'song') {
      return (
        <SongFeedCard
          key={feedItem.sid}
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
        <InfiniteScroll
          dataLength={feedItems.length}
          next={nextFeedItems}
          hasMore={gotNextFeedItems}
          loader={<Spinner className={styles.spinner} />}
        >
          {renderableItems}
        </InfiniteScroll>
      </div>
    </div>
  );
}

export default connect()(memo(Feed));
