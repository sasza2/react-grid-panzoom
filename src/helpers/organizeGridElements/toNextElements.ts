import { GridElement } from 'types';
import { getSelectedElementsIds } from './getSelectedElementsIds';
import { ElementWrapped } from './types';

export const toNextElements = (
  map: Record<string, ElementWrapped>,
  selectedElements: Array<GridElement>,
): Array<GridElement> => {
  const selectedElementsIds = getSelectedElementsIds(selectedElements);

  const uniqueElements: Record<string, ElementWrapped> = {};
  Object.values(map).forEach((elementWrapped) => {
    const key = `${elementWrapped.startX}_${elementWrapped.startY}`;
    uniqueElements[key] = elementWrapped;
  });

  return Object.values(uniqueElements).map((elementWrapped) => {
    const hasSamePosition = elementWrapped.startX === elementWrapped.element.x
      && elementWrapped.startY === elementWrapped.element.y;
    const isCurrentlyMoving = selectedElementsIds.includes(elementWrapped.element.id);
    if (isCurrentlyMoving) {
      return selectedElements.find((curr) => curr.id === elementWrapped.element.id);
    }
    if (hasSamePosition) {
      return elementWrapped.element;
    }

    return {
      ...elementWrapped.element,
      x: elementWrapped.startX,
      y: elementWrapped.startY,
    };
  });
};
