import store from '../store';
import { setGridWidth } from "../actions/studioActions";

// eslint-disable-next-line import/prefer-default-export
export const gridResize = () => {
    const { tracks, tracksRef, studio, dispatch } = store.getState();
    const latest = tracks.reduce((m, track) => {
      const sampleMax = track.samples
        ? track.samples.reduce((sm, sample) => {
          const endTime = sample.time + sample.duration * (studio.tempo / 60);
          return Math.max(endTime, sm);
        }, 1)
        : 1;
      return Math.max(sampleMax, m);
    }, 1);
    const width = Math.max(
      latest,
      tracksRef.current
        ? tracksRef.current.getBoundingClientRect().width
            / (40 * studio.gridSize)
        : 0,
    );
    dispatch(setGridWidth(width));
};