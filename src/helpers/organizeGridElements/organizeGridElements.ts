import { GridElement, OrganizeGridElements } from 'types';
import getInternalRows from '../getInternalRows';
import { appendElementToMap } from './appendElementToMap';
import { createHorizontalMovement } from './createHorizontalMovement';
import { createMap } from './createMap';
import { createVerticalMovement } from './createVerticalMovement';
import { getFirstSelectedElement } from './getFirstSelectedElement';
import { getFirstSelectedElementOriginal } from './getFirstSelectedElementOriginal';
import { hasAnyCollisions } from './hasAnyCollisions';
import { sortElementsByY } from './sortElementsByY';
import { startingElementsWithoutSelected } from './startingElementsWithoutSelected';
import { toNextElements } from './toNextElements';

type CreateOrganizeGridElements = (options: {
  removeEmptySpaceBelow?: boolean,
}) => OrganizeGridElements

const createOrganizer: CreateOrganizeGridElements = ({ removeEmptySpaceBelow }) => ({
  startingElements,
  cols,
  measureElementHeight,
  rows,
  selectedElements,
}) => {
  const firstSelectedElement = getFirstSelectedElement(selectedElements);
  const selectedElementOriginal = getFirstSelectedElementOriginal(selectedElements, startingElements);
  const map = createMap(selectedElements, measureElementHeight);
  const internalRows = getInternalRows({
    elements: startingElements,
    measureElementHeight,
    rows,
  });

  const {
    lowestYOfMovedElement,
    tryToMoveVertical,
  } = createVerticalMovement({
    internalRows,
    map,
    measureElementHeight,
    removeEmptySpaceBelow,
    selectedElements,
    startingElements,
  });

  const {
    tryToMoveHorizontal,
  } = createHorizontalMovement({
    cols,
    map,
    measureElementHeight,
    selectedElements,
    startingElements,
  });

  let lowestYOfMovedElementTmp = lowestYOfMovedElement;

  const sortedElements = sortElementsByY(
    startingElementsWithoutSelected(startingElements, selectedElements),
  );

  const pick = (element: GridElement) => {
    if (element.disabled) {
      const collisions = hasAnyCollisions(map, element, measureElementHeight);
      if (!collisions.length) appendElementToMap(map, element, measureElementHeight, 0, 0);
      return;
    }

    const yPosition = tryToMoveVertical(element);
    if (yPosition !== null) {
      appendElementToMap(map, element, measureElementHeight, 0, yPosition);
      return;
    }

    const xPosition = tryToMoveHorizontal(element);
    if (xPosition !== null) {
      appendElementToMap(map, element, measureElementHeight, xPosition, 0);
      return;
    }

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < internalRows; y++) {
        const collisions = hasAnyCollisions(
          map,
          element,
          measureElementHeight,
          x - element.x,
          y - element.y,
        );
        if (collisions.length) continue;
        if (lowestYOfMovedElementTmp !== -1) {
          if (y < lowestYOfMovedElementTmp) continue;
        }
        lowestYOfMovedElementTmp = y;
        appendElementToMap(map, element, measureElementHeight, x - element.x, y - element.y);
        return;
      }
    }
  };

  const loopElements = () => {
    if (!removeEmptySpaceBelow && selectedElementOriginal) {
      for (let i = 0; i < sortedElements.length; i++) {
        const element = sortedElements[i];
        if (internalRows > 1 && element.y <= firstSelectedElement.y
          && element.y <= selectedElementOriginal.y
        ) {
          pick(element);
          sortedElements.splice(i, 1);
          return;
        }
        const collisions = hasAnyCollisions(map, element, measureElementHeight);
        if (collisions.length) {
          pick(element);
          sortedElements.splice(i, 1);
          return;
        }
      }
    }

    pick(sortedElements[0]);
    sortedElements.shift();
  };

  while (sortedElements.length) {
    loopElements();
  }

  const nextElements = toNextElements(map, selectedElements);
  return nextElements;
};

export const defaultOrganizeGridElements = createOrganizer({
  removeEmptySpaceBelow: false,
});

export const organizeGridElementsWithBringUp = createOrganizer({
  removeEmptySpaceBelow: true,
});
