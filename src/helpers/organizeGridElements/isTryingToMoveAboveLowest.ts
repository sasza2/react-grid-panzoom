import { GridElement } from 'types';
import { areElementsOnSameVerticalLine } from './areElementsOnSameVerticalLine';

export const isTryingToMoveAboveLowest = (
  yPositionsOfElementsAbove: Map<number, GridElement[]>,
  yPositionsOfElementsBelow: Map<string | number, number>,
  element: GridElement,
  yOffset: number,
): boolean => {
  const elementsAbove: GridElement[] = [];

  yPositionsOfElementsAbove.forEach((elements, y) => {
    if (y > element.y) return;

    elements.forEach((item) => {
      if (y < element.y && areElementsOnSameVerticalLine(element, item)) elementsAbove.push(item);
    });
  });

  let isTryingToMoveAboveLowestReturn = true;

  const line = element.y + yOffset;
  elementsAbove.forEach((item) => {
    const currentYOfElement = yPositionsOfElementsBelow.get(item.id);
    if (currentYOfElement === undefined) return;

    if (currentYOfElement > line) isTryingToMoveAboveLowestReturn = false;
  });

  return isTryingToMoveAboveLowestReturn;
};
