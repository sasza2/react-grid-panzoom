import { GridElement, MeasureElementHeight } from 'types';
import { loopInMap } from './loopInMap';
import { ElementWrapped } from './types';

export const appendElementToMap = (
  map: Record<string, ElementWrapped>,
  element: GridElement,
  measureElementHeight: MeasureElementHeight,
  offsetX = 0,
  offsetY = 0,
) => {
  let elementWrapped: ElementWrapped | null = null;
  loopInMap(element, offsetX, offsetY, (x, y, startX, startY) => {
    if (!elementWrapped) elementWrapped = { element, startX, startY };
    map[`${x}_${y}`] = elementWrapped;
  }, measureElementHeight);
};
