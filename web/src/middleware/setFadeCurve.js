import { lerp, map } from '../helpers/utils';

export default (gain, context, startTime, endTime, fadeIn, fadeOut) => {
  const fadeInEndTime = lerp(startTime, endTime, fadeIn);
  gain.gain.cancelScheduledValues(context.currentTime);
  gain.gain.setValueAtTime(
    Math.min(1, map(context.currentTime, startTime, fadeInEndTime, 0, 1)) || 0,
    startTime,
  );
  gain.gain.linearRampToValueAtTime(
    1,
    fadeInEndTime,
  );

  const fadeOutBeginTime = lerp(startTime, endTime, 1 - fadeOut);
  gain.gain.setValueAtTime(
    Math.min(1, 1 - map(context.currentTime, fadeOutBeginTime, endTime, 0, 1)) || 1,
    fadeOutBeginTime,
  );
  gain.gain.linearRampToValueAtTime(0, endTime);
};
