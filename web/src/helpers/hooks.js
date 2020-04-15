import { useEffect, useRef, useState } from 'react';
import { useMouseEvents, useGlobalEvent } from 'beautiful-react-hooks';
import store from '../store';
import { getUserDetails } from './api';
import {
  setProfilePicUrl, setFollowers, setFollowing, setLikes, setPosts, setSongs, setFollowStatus,
  setProfiler,
} from '../actions/userActions';
import { showNotification } from '../actions/notificationsActions';

// eslint-disable-next-line import/prefer-default-export
export const useUpdateUserDetails = () => {
  const { user } = store.getState();
  const url = new URL(window.location.href);
  const username = url.searchParams.get('username');

  const dispatchProfileData = (res) => {
    store.dispatch(setProfiler(res.data.profile_pic_url));
    store.dispatch(setFollowers(res.data.followers));
    store.dispatch(setFollowing(res.data.following));
    store.dispatch(setLikes(res.data.likes));
    store.dispatch(setPosts(res.data.posts));
    store.dispatch(setSongs(res.data.songs));
    store.dispatch(setFollowStatus(res.data.follow_status));
  };

  useEffect(() => {
    if (user.token) {
      if (!username) {
        getUserDetails(user.username).then((res) => {
          if (res.status === 200) {
            dispatchProfileData(res);
            store.dispatch(setProfilePicUrl(res.data.profile_pic_url));
          } else {
            store.dispatch(showNotification({ message: 'An unknown error has occurred.' }));
          }
        });
      } else {
        getUserDetails(username).then((res) => {
          if (res.status === 200) {
            dispatchProfileData(res);
          } else {
            store.dispatch(showNotification({ message: 'An unknown error has occurred.' }));
          }
        });
        getUserDetails(user.username).then((res) => {
          if (res.status === 200) {
            store.dispatch(setProfilePicUrl(res.data.profile_pic_url));
          } else {
            store.dispatch(showNotification({ message: 'An unknown error has occurred.' }));
          }
        });
      }
    }
  }, [user.token, user.username, username]);
};

export const useGlobalDrag = (ref) => {
  const startHandler = useRef();
  const posHandler = useRef();
  const endHandler = useRef();
  const [startCoords, setStartCoords] = useState({});
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({});
  const { onMouseDown } = useMouseEvents(ref);
  const onMouseMove = useGlobalEvent('mousemove');
  const onMouseUp = useGlobalEvent('mouseup');

  onMouseDown((e) => {
    if (e.button === 0) {
      const bb = e.target.getBoundingClientRect();
      e.stopPropagation();
      setDragging(true);
      setStartCoords({ oldX: bb.x, oldY: bb.y });
      setOffset({ x: e.clientX - bb.x, y: e.clientY - bb.y });
      if (startHandler.current) startHandler.current();
    }
  });

  onMouseMove((e) => {
    if (!dragging) return;
    e.preventDefault();
    const newPos = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    if (posHandler.current) posHandler.current({ ...startCoords, ...newPos });
  });

  onMouseUp(() => {
    if (dragging && endHandler.current) endHandler.current();
    setDragging(false);
  });

  return {
    onDragStart: (cb) => {
      startHandler.current = cb;
    },
    onDragging: (cb) => {
      posHandler.current = cb;
    },
    onDragEnd: (cb) => {
      endHandler.current = cb;
    },
  };
};

export const useMidi = () => {
  const onMidiMessageHandler = useRef();
  const onMidiErrorHandler = useRef();

  const midiInputs = useRef();
  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      if (onMidiErrorHandler.current) onMidiErrorHandler.current('WebMIDI is not supported in this browser');
    } else {
      navigator.requestMIDIAccess()
        .then((midi) => {
          midiInputs.current = midi.inputs;
          [...midiInputs.current.values()].forEach((input) => {
            // eslint-disable-next-line no-param-reassign
            input.onmidimessage = (message) => {
              if (onMidiMessageHandler.current) onMidiMessageHandler.current(message, input);
            };
          });
        }, (error) => {
          if (onMidiErrorHandler.current) onMidiErrorHandler.current(`Error requesting MIDI access: ${error}`);
        });
    }
  }, []);

  return {
    onMidiMessage: (cb) => {
      onMidiMessageHandler.current = cb;
    },
    onMidiError: (cb) => {
      onMidiErrorHandler.current = cb;
    },
  };
};

export const useIsKeyDown = (keyCode) => {
  const [isKeyDown, setIsKeyDown] = useState(false);

  useEffect(() => {
    const keyDownHandler = (e) => {
      if (e.keyCode === keyCode) {
        setIsKeyDown(true);
      }
    };

    const keyUpHandler = (e) => {
      if (e.keyCode === keyCode) {
        setIsKeyDown(false);
      }
    };

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);

    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isKeyDown;
};

export const useEffectAfterMount = (cb, deps) => {
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
    } else {
      return cb();
    }
    return undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
