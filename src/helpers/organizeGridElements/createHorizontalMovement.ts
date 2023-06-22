import { GridElement, MeasureElementHeight } from 'types';
import { getFirstSelectedElement } from './getFirstSelectedElement';
import { getSelectedElementOriginal } from './getSelectedElementOriginal';
import { hasAnyCollisions } from './hasAnyCollisions';
import { ElementWrapped } from './types';

export const createHorizontalMovement = ({
  cols,
  map,
  measureElementHeight,
  selectedElements,
  startingElements,
}: {
  cols: number,
  map: Record<string, ElementWrapped>,
  measureElementHeight: MeasureElementHeight,
  selectedElements: GridElement[],
  startingElements: GridElement[],
}) => {
  const firstSelectedElement = getFirstSelectedElement(selectedElements);
  const selectedElementOriginal = getSelectedElementOriginal(selectedElements, startingElements);

  const tryToMoveLeft = (element: GridElement): number | null => {
    for (let { x } = element; x >= 0; x--) {
      const collisions = hasAnyCollisions(map, element, measureElementHeight, x - element.x, 0);
      if (collisions.length) continue;

      return x - element.x;
    }

    return null;
  };

  const tryToMoveRight = (element: GridElement): number | null => {
    for (let { x } = element; x <= cols - element.w; x++) {
      const collisions = hasAnyCollisions(map, element, measureElementHeight, x - element.x, 0);
      if (collisions.length) continue;

      return x - element.x;
    }

    return null;
  };

  const tryToMoveHorizontal = (element: GridElement): number | null => {
    const yLeft = tryToMoveLeft(element);
    const yRight = tryToMoveRight(element);

    if (yLeft === null && yRight === null) return null;
    if (yLeft === null) return yRight;
    if (yRight === null) return yLeft;

    const yLeftAbs = Math.abs(yLeft);
    const yRightAbs = Math.abs(yRight);

    if (yLeftAbs === yRightAbs && selectedElementOriginal) {
      const horizontalDiff = firstSelectedElement.x - selectedElementOriginal.x;
      return horizontalDiff > 0 ? yLeft : yRight;
    }

    return yLeftAbs > yRightAbs ? yRight : yLeft;
  };

  return {
    tryToMoveHorizontal,
    tryToMoveLeft,
    tryToMoveRight,
  };
};
