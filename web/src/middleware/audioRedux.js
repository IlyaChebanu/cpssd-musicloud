/* eslint-disable no-param-reassign */
import _ from 'lodash';
import Tone from 'tone';
// eslint-disable-next-line import/no-cycle
import {
  playingStartTime, setCurrentBeat, playingStartBeat, stop,
} from '../actions/studioActions';
import {
  scheduledSamples,
} from '../helpers/constants';
// eslint-disable-next-line import/no-cycle
import scheduleSample from './scheduleSample';
import stopSample from './stopSample';
import beatsToSeconds from './beatsToSeconds';
import playNote from './playNote';
import setFadeCurve from './setFadeCurve';

const setEffectValues = (adapter, effectNodeObject, desiredEffectsState) => {
  const audioContext = Tone.context.rawContext;

  Object.keys(desiredEffectsState).forEach((effectName) => {
    if (!effectNodeObject[effectName]) {
      effectNodeObject[effectName] = new Tone[effectName]();
    }
  });

  Object.entries(effectNodeObject).forEach(([effectName, effectNode]) => {
    if (!desiredEffectsState[effectName]) {
      delete effectNodeObject[effectName];
      return;
    }

    const desiredEffectParameters = Object.keys(desiredEffectsState[effectName]);
    desiredEffectParameters.forEach((parameterName) => {
      const parameter = desiredEffectsState[effectName][parameterName];

      if (parameter.isSignal) {
        effectNode[parameterName].setValueAtTime(parameter.value);
      } else {
        effectNode[parameterName] = parameter.value;
      }
    });
  });

  adapter.disconnect();

  if (Object.keys(effectNodeObject).length) {
    const effectNodes = Object.values(effectNodeObject);
    effectNodes.forEach((node) => {
      node.disconnect();
    });
    adapter.chain(...effectNodes);
    effectNodes[effectNodes.length - 1].connect(audioContext.globalGain);
  } else {
    adapter.connect(audioContext.globalGain);
  }
};

const setTrackChannel = (track, soloTrack, channels) => {
  const audioContext = Tone.context.rawContext;
  const gain = audioContext.createGain();
  const pan = audioContext.createStereoPanner();
  const muterGain = audioContext.createGain();

  const adapter = new Tone.Gain();

  gain.gain.setValueAtTime(track.volume, 0);
  pan.pan.setValueAtTime(track.pan, 0);
  muterGain.gain.setValueAtTime(1 * (
    soloTrack ? soloTrack.id === track.id : !track.mute
  ), 0);

  gain.connect(pan);
  pan.connect(muterGain);
  // eslint-disable-next-line no-underscore-dangle
  muterGain.connect(adapter._gainNode);

  const effects = {};
  setEffectValues(adapter, effects, track.effects);

  channels[track.id] = {
    gain,
    pan,
    muterGain,
    effects,
    adapter,
  };
};


export const renderTracks = (studio, studioUndoable) => {
  const samples = Object.values(studioUndoable.present.samples);
  const getEndTime = (sample) => sample.time + sample.duration;
  const latestSample = _.maxBy(samples, (sample) => getEndTime(sample));
  const songDuration = getEndTime(latestSample) * (60 / studio.tempo);
  return Tone.Offline(() => {
    const offlineAudioContext = Tone.context.rawContext;

    offlineAudioContext.globalGain = offlineAudioContext.createGain();
    offlineAudioContext.globalGain.connect(offlineAudioContext.destination);

    const soloTrack = _.find(studioUndoable.present.tracks, 'solo');
    const offlineTrackChannels = {};
    studioUndoable.present.tracks.forEach((track) => {
      setTrackChannel(track, soloTrack, offlineTrackChannels);
    });

    samples.forEach((sample) => {
      const channel = offlineTrackChannels[sample.trackId];
      scheduleSample(sample, channel.gain, offlineAudioContext, true);
    });
  }, songDuration);
};


export default (store) => {
  const audioContext = Tone.context.rawContext;
  const trackChannels = {};

  const startPlayback = () => {
    const { studio, studioUndoable } = store.getState();
    Object.entries(studioUndoable.present.samples).forEach(([sampleId, sample]) => {
      if (sample.time + sample.duration > studio.currentBeat && (
        studio.loopEnabled
          ? sample.time + sample.duration >= studio.loop.start
            && sample.time < studio.loop.stop
          : true
      )) {
        const channel = trackChannels[sample.trackId];
        scheduledSamples[sampleId] = scheduleSample(sample, channel.gain);
      }
    });
  };

  const stopPlayback = () => {
    Object.entries(scheduledSamples).forEach(([sampleId, sample]) => {
      stopSample(sample);
      delete scheduledSamples[sampleId];
    });
  };

  const getTrackVolume = (
    track,
    volume,
    tracks = store.getState().studioUndoable.present.tracks,
  ) => {
    const soloTrack = _.find(tracks, 'solo');
    return volume * (
      soloTrack ? soloTrack.id === track.id : !track.mute
    );
  };


  let animation;

  // Update currentBeat in redux to animate seek bar
  const beatUpdate = () => {
    const state = store.getState().studio;
    if (state.playing && window.location.pathname !== '/studio') {
      store.dispatch(stop);
    }
    if (state.playing && window.location.pathname === '/studio') {
      animation = requestAnimationFrame(beatUpdate);
      const secondsPerBeat = 60 / state.tempo;
      let currentBeat = (
        state.playingStartBeat
        + (audioContext.currentTime - state.playingStartTime)
        / secondsPerBeat
      );
      if (state.loopEnabled && currentBeat > state.loop.stop) {
        currentBeat = state.loop.start + currentBeat - state.loop.stop;
        store.dispatch(setCurrentBeat(currentBeat));
        store.dispatch(playingStartBeat(state.loop.start));
        store.dispatch(playingStartTime(audioContext.currentTime));
        state.currentBeat = currentBeat;
        startPlayback();
      } else {
        store.dispatch(setCurrentBeat(currentBeat));
      }
    }
  };

  return (next) => async (action) => {
    const state = store.getState().studio;
    const { studioUndoable } = store.getState();
    switch (action.type) {
      case 'STUDIO_PLAY': {
        store.dispatch(playingStartTime(audioContext.currentTime));
        store.dispatch(playingStartBeat(state.currentBeat));
        state.playingStartBeat = state.currentBeat;
        animation = requestAnimationFrame(beatUpdate);
        startPlayback();
        break;
      }

      case 'STUDIO_PAUSE':
        stopPlayback();
        if (animation) cancelAnimationFrame(animation);
        break;

      case 'STUDIO_STOP':
        store.dispatch(playingStartBeat(state.loopEnabled ? state.loop.start : 1));
        store.dispatch(setCurrentBeat(state.loopEnabled ? state.loop.start : 1));
        stopPlayback();
        if (animation) cancelAnimationFrame(animation);
        break;

      case 'SET_VOLUME':
        audioContext.globalGain.gain.setValueAtTime(action.volume, audioContext.currentTime);
        break;

      case 'REMOVE_TRACK': {
        Object.entries(scheduledSamples).forEach(([sampleId, sample]) => {
          if (sample.trackId === action.trackId) {
            stopSample(sample);
            delete scheduledSamples[sampleId];
          }
        });
        delete trackChannels[action.trackId];
        break;
      }

      case 'SET_COMPLETE_TRACKS_STATE': {
        const soloTrack = _.find(action.tracks, 'solo');
        action.tracks.forEach((track) => {
          setTrackChannel(track, soloTrack, trackChannels);
        });
        break;
      }

      case 'ADD_TRACK': {
        const soloTrack = _.find([...studioUndoable.present.tracks, action.track], 'solo');
        setTrackChannel(action.track, soloTrack, trackChannels);
        break;
      }

      case 'SET_TRACK_VOLUME': {
        const track = _.find(studioUndoable.present.tracks, (o) => o.id === action.trackId);
        trackChannels[action.trackId].gain.gain.setValueAtTime(
          getTrackVolume(track, action.value),
          0,
        );
        break;
      }

      case 'SET_TRACK_PAN': {
        trackChannels[action.trackId].pan.pan.setValueAtTime(action.value, 0);
        break;
      }

      case 'SET_TRACK_EFFECTS': {
        const track = trackChannels[action.trackId];
        setEffectValues(track.adapter, track.effects, action.effects);
        break;
      }

      case 'SET_TRACK_MUTE': {
        const soloTrack = _.find(state.tracks, 'solo');
        const mVal = 1 * (soloTrack ? soloTrack.id === action.trackId : !action.value);

        const channel = trackChannels[action.trackId];
        if (mVal) {
          channel.muterGain.gain.setValueAtTime(0, 0);
          channel.muterGain.gain.exponentialRampToValueAtTime(1, audioContext.currentTime + 0.01);
        } else {
          channel.muterGain.gain.setValueAtTime(1, 0);
          channel.muterGain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.01,
          );
          channel.muterGain.gain.setValueAtTime(0, audioContext.currentTime + 0.01);
        }
        break;
      }

      case 'SET_TRACK_SOLO': {
        Object.entries(trackChannels).forEach(([trackId, channel]) => {
          const track = _.find(studioUndoable.present.tracks, (o) => o.id === trackId);
          if (!track) {
            return;
          }
          if (trackId === action.trackId) {
            if (action.value && !channel.muterGain.gain.value) {
              // Unmute solo'd track
              channel.muterGain.gain.setValueAtTime(0, 0);
              channel.muterGain.gain.exponentialRampToValueAtTime(
                1,
                audioContext.currentTime + 0.01,
              );
            } else if (!action.value && track.mute) {
              // Mute when solo turned off and mute was originally on
              channel.muterGain.gain.setValueAtTime(1, 0);
              channel.muterGain.gain.exponentialRampToValueAtTime(
                0.001,
                audioContext.currentTime + 0.01,
              );
              channel.muterGain.gain.setValueAtTime(0, audioContext.currentTime + 0.01);
            }
          } else if (action.value && !track.mute) {
            // Mute if not already muted, solo on another track
            channel.muterGain.gain.setValueAtTime(1, 0);
            channel.muterGain.gain.exponentialRampToValueAtTime(
              0.001,
              audioContext.currentTime + 0.01,
            );
            channel.muterGain.gain.setValueAtTime(0, audioContext.currentTime + 0.01);
          } else if (!action.value && !track.mute) {
            // Solo turned off, unmute if not already muted
            channel.muterGain.gain.setValueAtTime(0, 0);
            channel.muterGain.gain.exponentialRampToValueAtTime(
              1,
              audioContext.currentTime + 0.01,
            );
          }
        });
        break;
      }

      case 'REMOVE_SAMPLE': {
        const sample = scheduledSamples[action.sampleId];

        if (sample) {
          stopSample(sample);
          delete scheduledSamples[action.sampleId];
        }
        break;
      }

      case 'SET_SAMPLE_START_TIME': {
        const sample = scheduledSamples[action.sampleId];

        if (sample && sample.time !== action.value) {
          stopSample(sample);
          delete scheduledSamples[action.sampleId];

          const channel = trackChannels[sample.trackId];
          scheduledSamples[action.sampleId] = scheduleSample(
            { ...sample, time: action.value },
            channel.gain,
          );
        }
        break;
      }

      case 'SET_SAMPLE_FADE_IN': {
        const sample = scheduledSamples[action.sampleId];
        const stateSample = studioUndoable.present.samples[action.sampleId];

        if (sample) {
          const startTime = audioContext.currentTime + beatsToSeconds(
            sample.time - state.currentBeat,
            state.tempo,
          );
          const endTime = audioContext.currentTime + beatsToSeconds(
            sample.time + sample.duration - state.currentBeat,
            state.tempo,
          );

          setFadeCurve(
            sample.gain,
            audioContext,
            startTime,
            endTime,
            action.value,
            stateSample.fade.fadeOut,
          );
        }
        break;
      }

      case 'SET_SAMPLE_FADE_OUT': {
        const sample = scheduledSamples[action.sampleId];
        const stateSample = studioUndoable.present.samples[action.sampleId];

        if (sample) {
          const startTime = audioContext.currentTime + beatsToSeconds(
            sample.time - state.currentBeat,
            state.tempo,
          );
          const endTime = audioContext.currentTime + beatsToSeconds(
            sample.time + sample.duration - state.currentBeat,
            state.tempo,
          );

          setFadeCurve(
            sample.gain,
            audioContext,
            startTime,
            endTime,
            stateSample.fade.fadeIn,
            action.value,
          );
        }
        break;
      }

      case 'REMOVE_PATTERN_NOTE': {
        const sample = scheduledSamples[action.sampleId];

        if (sample) {
          const note = sample.notes[action.noteId];

          if (note && note.source) {
            if (note.url) {
              note.source.stop();
            } else {
              note.source.triggerRelease();
            }
          }
        }
        break;
      }

      case 'SET_PATTERN_NOTE_TICK': {
        const sample = scheduledSamples[action.sampleId];

        if (sample) {
          const note = sample.notes[action.noteId];

          if (note) {
            if (note.source) {
              if (note.url) {
                note.source.stop();
              } else {
                note.source.triggerRelease();
              }
            }

            // Reschedule note
            const noteTime = sample.time + action.value * (0.25 / state.ppq);
            const noteDuration = note.duration * (0.25 / state.ppq);

            const noteStartTime = audioContext.currentTime + beatsToSeconds(
              noteTime - state.currentBeat, state.tempo,
            );
            const noteEndTime = audioContext.currentTime + beatsToSeconds(
              noteTime + noteDuration - state.currentBeat,
              state.tempo,
            );
            const noteOffset = Math.max(
              0,
              beatsToSeconds(state.currentBeat - noteTime, state.tempo),
            );
            note.source = playNote(
              audioContext,
              note,
              sample.gain,
              noteStartTime,
              noteOffset,
              noteEndTime,
              sample.url,
              sample.patch,
            );
          }
        }
        break;
      }

      case 'SET_PATTERN_NOTE_NUMBER': {
        const sample = scheduledSamples[action.sampleId];

        if (sample) {
          const note = sample.notes[action.noteId];

          if (!sample.url) {
            note.source.frequency.setValueAtTime(2 ** ((action.value - 49) / 12) * 440, 0);
          }
        }
        break;
      }

      case 'SET_PATTERN_NOTE_DURATION': {
        const sample = scheduledSamples[action.sampleId];

        if (sample) {
          const note = sample.notes[action.noteId];

          const noteTime = sample.time + note.tick * (0.25 / state.ppq);
          const noteDuration = action.value * (0.25 / state.ppq);

          const noteStartTime = audioContext.currentTime + beatsToSeconds(
            noteTime - state.currentBeat, state.tempo,
          );
          const noteEndTime = audioContext.currentTime + beatsToSeconds(
            noteTime + noteDuration - state.currentBeat,
            state.tempo,
          );
          const noteOffset = Math.max(0, beatsToSeconds(state.currentBeat - noteTime, state.tempo));

          if (note.url) {
            note.source.stop(noteEndTime);
          } else {
            note.source.triggerRelease(`+${noteEndTime - audioContext.currentTime}`);
          }

          if (
            noteTime + noteDuration > state.currentBeat
            && noteTime + note.duration * (0.25 / state.ppq) < state.currentBeat
          ) {
            // If the note was extended past the previous duration & not currently playing
            // Recalculate pattern duration, popFilter and fade

            const latest = _.maxBy(
              Object.values({
                ...sample.notes,
                [action.noteId]: { ...note, duration: action.value },
              }),
              (n) => n.tick + n.duration,
            );
            const sampleDuration = (0.25 / state.ppq) * (
              latest
                ? latest.tick + latest.duration
                : 0
            );
            const startTime = audioContext.currentTime + beatsToSeconds(
              sample.time - state.currentBeat, state.tempo,
            );
            const endTime = audioContext.currentTime + beatsToSeconds(
              sample.time + sampleDuration - state.currentBeat,
              state.tempo,
            );
            const offset = Math.max(
              0,
              beatsToSeconds(state.currentBeat - sample.time, state.tempo),
            );

            sample.popFilter.gain.setValueAtTime(0.001, 0);
            sample.popFilter.gain.exponentialRampToValueAtTime(1, startTime + offset + 0.01);
            sample.popFilter.gain.setValueAtTime(1, endTime - 0.01);
            sample.popFilter.gain.exponentialRampToValueAtTime(0.001, endTime);

            setFadeCurve(
              sample.gain,
              audioContext,
              startTime,
              endTime,
              sample.fade.fadeIn,
              sample.fade.fadeOut,
            );

            note.source = playNote(
              audioContext,
              note,
              sample.gain,
              noteStartTime,
              noteOffset,
              noteEndTime,
              sample.url,
              sample.patch,
            );
          }
        }
        break;
      }

      // TODO: Implement in future sprint
      case 'SET_PATTERN_NOTE_VELOCITY': {
        break;
      }

      default:
        break;
    }
    return next(action);
  };
};
