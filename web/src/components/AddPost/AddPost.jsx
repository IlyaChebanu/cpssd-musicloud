import React, { useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './AddPost.module.scss';
import Button from '../Button';
import { createPost } from '../../helpers/api';

const AddPost = (props) => {
  const { className, onSubmit, placeholder } = props;

  const textField = useRef();

  const { current } = textField;
  useEffect(() => {
    if (current) {
      current.textContent = placeholder;
    }
  }, [current, placeholder]);

  const submitPost = useCallback(async () => {
    await createPost(textField.current.textContent);
    textField.current.textContent = placeholder;
    onSubmit();
  }, [onSubmit, placeholder]);

  const handleFocus = useCallback(() => {
    if (textField.current.textContent === placeholder) {
      textField.current.textContent = '';
    }
  }, [placeholder]);

  const handleBlur = useCallback(() => {
    if (textField.current.textContent === '') {
      textField.current.textContent = placeholder;
    }
  }, [placeholder]);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div
        contentEditable
        className={styles.input}
        ref={textField}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <div className={styles.buttonWrapper}>
        <Button className={styles.postButton} onClick={submitPost}>Post</Button>
      </div>
    </div>
  );
};

AddPost.propTypes = {
  className: PropTypes.string,
  onSubmit: PropTypes.func,
  placeholder: PropTypes.string,
};

AddPost.defaultProps = {
  className: '',
  onSubmit: () => {},
  placeholder: '',
};

AddPost.displayName = 'AddPost';

export default AddPost;
