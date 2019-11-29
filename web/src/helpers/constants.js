export const emailRe = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const audioContext = new (window.AudioContext || window.webkitAudioContext)();

export const globalSongGain = audioContext.createGain();
globalSongGain.connect(audioContext.destination);

export const bufferStore = {};

export const colours = [
  '#FD1F76',
  '#FF594C',
  '#FEB233',
  '#EAB740',
  '#5CBB4E',
  '#4DAC7A',
  '#5696B1',
  '#9B57A2',
];

export const dColours = [
  '#C52161',
  '#D66B62',
  '#E7B562',
  '#ACB164',
  '#6FAD66',
  '#62A080',
  '#6790A2',
  '#8D6192',
];
