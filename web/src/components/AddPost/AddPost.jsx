import React from 'react';
import PropTypes from 'prop-types';
import styles from './AddPost.module.scss';
import InputField from '../InputField';
import SubmitButton from '../SubmitButton';

// TODO: Connect to redux

const AddPost = props => {
  return (
    <div className={styles.wrapper + (props.className ? ` ${props.className}` : '')}>
      <span className={styles.addPost}>
        <InputField className={styles.input} name="new_post" placeholder="Write something"/>
        <SubmitButton className={styles.postButton} text='Post'/>
      </span>
    </div>
  );
};

AddPost.propTypes = {
  className: PropTypes.string
};

export default AddPost;

