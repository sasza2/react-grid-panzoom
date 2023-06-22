import { GridElement, MeasureElementHeight } from 'types';
import { getFirstSelectedElement } from './getFirstSelectedElement';
import { getSelectedElementOriginal } from './getSelectedElementOriginal';
import { hasAnyCollisions } from './hasAnyCollisions';
import { ElementWrapped } from './types';
import { areElementsOnSameVerticalLine } from './areElementsOnSameVerticalLine';
import { isTryingToMoveAboveLowest } from './isTryingToMoveAboveLowest';

export const createVerticalMovement = ({
  internalRows,
  map,
  measureElementHeight,
  removeEmptySpaceBelow,
  selectedElements,
  startingElements,
}: {
  internalRows: number,
  map: Record<string, ElementWrapped>,
  measureElementHeight: MeasureElementHeight,
  removeEmptySpaceBelow?: boolean,
  selectedElements: GridElement[],
  startingElements: GridElement[],
}) => {
  const firstSelectedElement = getFirstSelectedElement(selectedElements);
  const selectedElementOriginal = getSelectedElementOriginal(selectedElements, startingElements);

  const yPositionsOfElementsAbove = new Map<number, GridElement[]>();
  const yPositionsOfElementsBelow = new Map<string | number, number>();
  startingElements.forEach((element) => {
    const list = yPositionsOfElementsAbove.get(element.y);
    if (list) {
      list.push(element);
    } else {
      yPositionsOfElementsAbove.set(element.y, [element]);
    }
  });

  let diff = -1;
  const lowestYOfMovedElement = -1;

  const tryToMoveAboveFirstSelected = (element: GridElement): number | null => {
    if (!areElementsOnSameVerticalLine(element, selectedElementOriginal)) {
      return null;
    }

    if (diff === -1) {
      diff = element.y - selectedElementOriginal.y;
    }

    for (let y = element.y - diff; y < element.y; y++) {
      const collisions = hasAnyCollisions(map, element, measureElementHeight, 0, y - element.y);
      if (collisions.length) continue;

      if (y > firstSelectedElement.y) {
        return null;
      }

      if (!isTryingToMoveAboveLowest(
        yPositionsOfElementsAbove,
        yPositionsOfElementsBelow,
        element,
        y - element.y,
      )) {
        return null;
      }

      return y - element.y;
    }

    return null;
  };

  const tryToMoveTop = (element: GridElement): number | null => {
    for (let { y } = element; y >= 0; y--) {
      if (removeEmptySpaceBelow && lowestYOfMovedElement !== -1) {
        if (y < lowestYOfMovedElement) return null;
      }

      const collisions = hasAnyCollisions(map, element, measureElementHeight, 0, y - element.y);
      if (collisions.length) continue;

      if (selectedElementOriginal) {
        if (!isTryingToMoveAboveLowest(
          yPositionsOfElementsAbove,
          yPositionsOfElementsBelow,
          element,
          y - element.y,
        )) {
          return null;
        }

        if (removeEmptySpaceBelow) {
          if (y < selectedElementOriginal.y && y < firstSelectedElement.y) {
            return null;
          }
          if (y > selectedElementOriginal.y && y > firstSelectedElement.y) {
            return null;
          }

          const yAboveFirstSelected = tryToMoveAboveFirstSelected(element);
          if (yAboveFirstSelected !== null) return yAboveFirstSelected;
        }
      }

      return y - element.y;
    }

    return null;
  };

  const tryToMoveBottom = (element: GridElement): number | null => {
    for (let { y } = element; y <= internalRows - measureElementHeight(element); y++) {
      const collisions = hasAnyCollisions(map, element, measureElementHeight, 0, y - element.y);
      if (collisions.length) continue;
      return y - element.y;
    }

    return null;
  };

  const tryToMoveVertical = (element: GridElement): number | null => {
    const yTop = tryToMoveTop(element);
    const yBottom = tryToMoveBottom(element);

    if (!selectedElementOriginal && yBottom !== null) return yBottom;

    if (removeEmptySpaceBelow && yTop !== null) {
      return yTop;
    }

    if (yTop === null && yBottom === null) return null;
    if (yTop === null) return yBottom;
    if (yBottom === null) return yTop;

    const yTopAbs = Math.abs(yTop);
    const yBottomAbs = Math.abs(yBottom);

    return yTopAbs > yBottomAbs ? yBottom : yTop;
  };

  const tryToMoveVerticalAndSetMap = (element: GridElement): number | null => {
    const yPos = tryToMoveVertical(element);
    if (yPos !== null) {
      const nextY = element.y + yPos;
      yPositionsOfElementsBelow.set(element.id, nextY);
    }

    return yPos;
  };

  return {
    lowestYOfMovedElement,
    selectedElementOriginal,
    tryToMoveVertical: tryToMoveVerticalAndSetMap,
  };
};
