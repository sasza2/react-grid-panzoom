import { GridElement, MeasureElementHeight } from 'types';
import { ElementWrapped } from './types';
import { loopInMap } from './loopInMap';

export const hasAnyCollisions = (
  map: Record<string, ElementWrapped>,
  element: GridElement,
  measureElementHeight: MeasureElementHeight,
  offsetX = 0,
  offsetY = 0,
): Array<ElementWrapped> => {
  const collisions: Record<string, ElementWrapped> = {};
  loopInMap(element, offsetX, offsetY, (x, y) => {
    const existingElement = map[`${x}_${y}`];
    if (existingElement) collisions[existingElement.element.id] = existingElement;
  }, measureElementHeight);
  return Object.values(collisions);
};
