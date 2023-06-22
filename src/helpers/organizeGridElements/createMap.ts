import { GridElement, MeasureElementHeight } from 'types';
import { appendElementToMap } from './appendElementToMap';
import { ElementWrapped } from './types';

export const createMap = (
  elements: Array<GridElement>,
  measureElementHeight: MeasureElementHeight,
): Record<string, ElementWrapped> => {
  const map: Record<string, ElementWrapped> = {};
  elements.forEach((element) => {
    appendElementToMap(map, element, measureElementHeight);
  });
  return map;
};
