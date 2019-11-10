export const emailRe =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const audioContext = new (window.AudioContext || window.webkitAudioContext)();
export const globalSongGain = audioContext.createGain();
globalSongGain.connect(audioContext.destination);
export const bufferStore = {};