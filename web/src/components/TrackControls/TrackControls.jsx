/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, {
  memo, useCallback, useMemo, useState, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import ReactTooltip from 'react-tooltip';
import styles from './TrackControls.module.scss';
import {
  setSelectedTrack,
  setSelectedSample,
  setTrackName,
  setTrackVolume,
  setTrackPan,
  setTrackMute,
  setTrackSolo,
  hideSampleEffects,
  setShowPianoRoll,
  removeTrack,
  showEffectsWindow,
} from '../../actions/studioActions';
import Knob from '../Knob';
import { ReactComponent as Mute } from '../../assets/icons/volume-up-light.svg';
import { ReactComponent as MuteActive } from '../../assets/icons/volume-slash-light.svg';
import { ReactComponent as Solo } from '../../assets/icons/headphones-alt-light.svg';
import { ReactComponent as SoloActive } from '../../assets/icons/headphones-alt-solid.svg';
import { ReactComponent as Delete } from '../../assets/icons/close-24px.svg';
import { ReactComponent as Sliders } from '../../assets/icons/sliders-v-square-light.svg';
import { clamp } from '../../helpers/utils';
import { colours } from '../../helpers/constants';
import Modal from '../Modal';

const TrackControls = memo((props) => {
  const {
    track, tracks, dispatch, index, selectedTrack,
  } = props;
  const soloTrack = _.find(tracks, 'solo');

  const [inputSelected, setInputSelected] = useState(false);
  const ref = useRef();

  const [isModalShowing, setIsModalShowing] = useState(false);

  const handleSetTrackVolume = useCallback((val) => {
    dispatch(setTrackVolume(track.id, clamp(0, 1, val)));
  }, [dispatch, track.id]);

  const handleSetTrackPan = useCallback((val) => {
    dispatch(setTrackPan(track.id, clamp(-1, 1, val)));
  }, [dispatch, track.id]);

  const handleTrackMute = useCallback((e) => {
    e.preventDefault();
    dispatch(setTrackMute(track.id, !track.mute));
  }, [dispatch, track.id, track.mute]);

  const handleTrackSolo = useCallback((e) => {
    e.preventDefault();
    dispatch(setTrackSolo(track.id, !track.solo));
  }, [dispatch, track.id, track.solo]);

  const handleTrackNameChange = useCallback((e) => {
    e.preventDefault();
    dispatch(setTrackName(track.id, e.target.value));
  }, [dispatch, track.id]);

  const handleSetSelected = useCallback((e) => {
    e.preventDefault();
    dispatch(setSelectedTrack(track.id));
    dispatch(setSelectedSample(''));
    dispatch(hideSampleEffects());
    dispatch(setShowPianoRoll(false));
  }, [dispatch, track.id]);

  const handleShowEffectsWindow = useCallback(() => {
    dispatch(showEffectsWindow());
  }, [dispatch]);


  const barStyle = useMemo(() => {
    const colour = index % 2 ? '#303237' : '#36393D';
    return {
      backgroundColor: selectedTrack === track.id ? colours[index % colours.length] : colour,
    };
  }, [index, selectedTrack, track.id]);

  const handleDeleteTrack = useCallback((e) => {
    // Stop propagation to void selecting track when deleting
    e.stopPropagation();
    dispatch(removeTrack(track.id));
  }, [dispatch, track.id]);

  const openModal = () => {
    setIsModalShowing(true);
  };

  const closeModal = () => {
    setIsModalShowing(false);
  };

  const deleteTrackModal = useMemo(() => (
    <div className={styles.modal} style={{ visibility: isModalShowing ? 'visible' : 'hidden' }}>

      { isModalShowing ? <div role="none" onClick={closeModal} className={styles.backDrop} /> : null}
      <Modal
        header="Confirm deleting track"
        className={styles.modal}
        show={isModalShowing}
        close={closeModal}
        submit={handleDeleteTrack}
      >
        Are you sure you want to delete track?
      </Modal>
    </div>


  ), [handleDeleteTrack, isModalShowing]);


  return (
    <div
      className={styles.outerWrap}
      onClick={handleSetSelected}
      role="row"
      tabIndex={0}
    >

      <div
        className={`${styles.selectBar} ${selectedTrack === index ? styles.selected : ''}`}
        style={barStyle}
      />
      <div role="none" onMouseDown={ReactTooltip.rebuild} className={`${styles.wrapper} ${props.index % 2 ? styles.even : ''}`}>
        <div data-place="right" data-tip="Delete track" data-for="tooltip" onMouseOver={ReactTooltip.rebuild}>
          <Delete onClick={openModal} className={styles.deleteTrack} />
        </div>
        <div
          className={styles.title}
        >
          <input
            data-place="right"
            data-tip={!inputSelected ? 'Rename track' : ''}
            data-for="tooltip"
            onMouseOver={ReactTooltip.rebuild}
            ref={(r) => { ref.current = r; }}
            onClick={() => {
              setInputSelected(true);
              ReactTooltip.hide(ref.current);
            }}
            onMouseMove={() => {
              if (inputSelected) {
                ReactTooltip.hide(ref.current);
              }
            }}
            onBlur={() => setInputSelected(false)}
            type="text"
            value={track.name}
            onChange={handleTrackNameChange}
          />
        </div>
        <div className={styles.buttons}>
          <Knob
            dataTip="Hold and move up or down to adjust the volume"
            min={0}
            max={1}
            value={track.volume}
            onChange={handleSetTrackVolume}
            name="Vol"
          />
          <Knob
            dataTip="Hold and move up or down to make the sound more prominent on one side or another"
            min={-1}
            max={1}
            value={track.pan}
            onChange={handleSetTrackPan}
            name="Pan"
          />
          <span data-place="right" data-tip={track.mute ? 'Unmute track' : 'Mute track'} data-for="tooltip" onMouseOver={ReactTooltip.rebuild}>
            {track.mute || (soloTrack && soloTrack.id !== track.id)
              ? <MuteActive onClick={handleTrackMute} />
              : <Mute onClick={handleTrackMute} />}
            <p>Mute</p>
          </span>
          <span data-place="right" data-tip={track.solo ? 'Unsolo track' : 'Solo track'} data-for="tooltip" onMouseOver={ReactTooltip.rebuild}>
            {track.solo
              ? <SoloActive onClick={handleTrackSolo} />
              : <Solo onClick={handleTrackSolo} />}
            <p>Solo</p>
          </span>
          <span data-place="right" data-tip="Show effects window" data-for="tooltip" onMouseOver={ReactTooltip.rebuild}>
            <Sliders onClick={handleShowEffectsWindow} />
            <p>Effects</p>
          </span>
        </div>
      </div>
      {deleteTrackModal}
    </div>

  );
});

TrackControls.propTypes = {
  dispatch: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  track: PropTypes.object.isRequired,
  tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedTrack: PropTypes.any.isRequired,
};

TrackControls.displayName = 'TrackControls';

const mapStateToProps = ({ studio, studioUndoable }) => ({
  tracks: studioUndoable.present.tracks,
  selectedTrack: studio.selectedTrack,
});

export default connect(mapStateToProps)(TrackControls);
