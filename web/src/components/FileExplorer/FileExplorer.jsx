import React, {
  useState, useCallback, useMemo, memo, useRef, useEffect,
} from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import AWS from 'aws-sdk';
import * as s3ls from 's3-ls';
import styles from './FileExplorer.module.scss';
import samplesIcon from '../../assets/icons/samples.svg';
import instrumentsIcon from '../../assets/icons/instruments.svg';
import { ReactComponent as NewFolder } from '../../assets/icons/newFolder.svg';
import { getRootFolderContents } from '../../helpers/api';
import FolderContents from '../FolderContents/FolderContents';
import {
  hideFileExplorer,
} from '../../actions/studioActions';
import { showNotification } from '../../actions/notificationsActions';


const FileExplorer = memo((props) => {
  const { dispatch } = props;
  const [fileList, setFileList] = useState([]);
  const [folderList, setFolderList] = useState([]);

  const [sampleTreeSelected, setSampleTreeSelected] = useState(false);
  const node = useRef();
  const getFiles = useCallback(async () => {
    const res = await getRootFolderContents();
    if (res.status === 200) {
      const files = res.data['folder']['child_files']
      const folders = res.data['folder']['child_folders']
      setFileList(files);
      setFolderList(folders);
      return;
    }
    dispatch(showNotification({
      message: res,
    }));
  }, [dispatch]);

  const collapseSampleTree = useCallback(() => {
    setSampleTreeSelected(false);
    setFileList([]);
    setFolderList([]);
  }, []);


  const instruments = [
    { name: 'Instruments', action: null, icon: instrumentsIcon },
  ];

  const instrumentsMap = useMemo(
    () => instruments.map((item) => (
      <li
        key={item.name}
        onMouseDown={() => {
          if (item.action) item.action();
        }}
      >
        {item.icon && (
        <img
          className={styles.icon}
          src={item.icon}
          alt="explorer item icon"
        />
        )}
        <p>{item.name}</p>
      </li>
    )),
    [instruments],
  );

  const handleClick = useCallback((e) => {
    try {
      if (node.current.contains(e.target)) {
        // inside click
        return;
      } if ((e.target.id === 'explorer')
      || (e.toElement.viewportElement.id === 'explorer')) {
      // or click on file explorer button
        collapseSampleTree();
        return;
      }
    } catch (err) {
      // outside click
      if (!props.fileExplorerHidden) {
        dispatch(hideFileExplorer());
        setFileList([]);
      }
    }
  }, [collapseSampleTree, dispatch, props.fileExplorerHidden]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [handleClick]);
  return (
    <div
      ref={node}
      style={{ maxWidth: props.fileExplorerHidden ? '0%' : '30%' }}
      className={styles.explorer}
    >
      <ul>
        <li
          key="Samples"
          onClick={sampleTreeSelected ? collapseSampleTree : getFiles}
          className={sampleTreeSelected ? styles.selected : ''}

        >
          {samplesIcon && (
          <img
            className={styles.icon}
            src={samplesIcon}
            alt="Samples icon"
          />
          )}
          <p>Samples</p>
          { sampleTreeSelected
            ? <NewFolder className={styles.newFolder} />
            : null }

        </li>
        <FolderContents

          files={fileList}
          folders={folderList}
          level={1}
        />
        {instrumentsMap}

      </ul>

    </div>
  );
});

FileExplorer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  fileExplorerHidden: PropTypes.bool.isRequired,
};

FileExplorer.displayName = 'FileExplorer';

const mapStateToProps = ({ studio }) => ({
  fileExplorerHidden: studio.fileExplorerHidden,
  studio,
});

export default withRouter(connect(mapStateToProps)(FileExplorer));
