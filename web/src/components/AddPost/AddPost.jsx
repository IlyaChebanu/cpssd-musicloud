import React from 'react';
import PropTypes from 'prop-types';
import styles from './AddPost.module.scss';
import InputField from '../InputField';
import SubmitButton from '../SubmitButton';

const AddPost = (props) => {
  const { className } = props;
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <span className={styles.addPost}>
        <InputField className={styles.input} name="new_post" placeholder="Write something" />
        <SubmitButton className={styles.postButton} text="Post" />
      </span>
    </div>
  );
};

AddPost.propTypes = {
  className: PropTypes.string,
};

AddPost.defaultProps = {
  className: '',
};

AddPost.displayName = 'AddPost';

export default AddPost;
