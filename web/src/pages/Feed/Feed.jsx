import React, {
  memo, useState, useEffect, useMemo,
} from 'react';
import { connect } from 'react-redux';
import styles from './Feed.module.scss';
import Header from '../../components/Header';
import { useUpdateUserDetails } from '../../helpers/hooks';
import { getTimeline } from '../../helpers/api';
import Spinner from '../../components/Spinner';
import PostCard from '../../components/PostCard';
import SongFeedCard from '../../components/SongFeedCard';

function Feed(props) {
  useUpdateUserDetails();

  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getTimeline();
      setLoading(false);
      if (res.status === 200) {
        setFeedItems(res.data.timeline);
      }
    })();
  }, []);

  const renderableItems = useMemo(() => feedItems.map((feedItem) => {
    if (feedItem.type === 'post') {
      return (
        <PostCard
          message={feedItem.message}
          username={feedItem.username}
          time={feedItem.created}
        />
      );
    }
    if (feedItem.type === 'song') {
      console.log(feedItem);
      return (
        <SongFeedCard
          time={feedItem.created}
          username={feedItem.username}
          title={feedItem.title}
          url={feedItem.url}
          duration={feedItem.duration}
          likes={feedItem.likes}
          coverImage={feedItem.cover}
        />
      );
    }
    return null;
  }), [feedItems]);

  return (
    <div className={styles.wrapper}>
      <Header selected={1} />
      <div className={styles.contentWrapper}>
        {loading ? <Spinner /> : renderableItems}
      </div>
    </div>
  );
}

export default connect()(memo(Feed));
