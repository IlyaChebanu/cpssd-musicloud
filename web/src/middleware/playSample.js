import { bufferStore } from '../helpers/constants';

export default (context, url, destination, time, offset = 0) => {
  if (!bufferStore[url]) {
    return null;
  }

  const source = context.createBufferSource();
  source.buffer = bufferStore[url];

  source.connect(destination);

  source.start(time, offset);
  return source;
};
