import { GridElement } from 'types';
import { sortElementsByY } from './sortElementsByY';

export const getSelectedElementsOriginal = (
  selectedElements: GridElement[],
  startingElements: GridElement[],
): GridElement[] => {
  const selectedElementsOriginal: GridElement[] = [];

  const startingElementsMap: Record<string | number, GridElement> = {};
  startingElements.forEach((element) => {
    startingElementsMap[element.id] = element;
  });

  selectedElements.forEach((element) => {
    const selectedElementOriginal = startingElementsMap[element.id];
    if (selectedElementOriginal) {
      selectedElementsOriginal.push(selectedElementOriginal);
    }
  });

  return sortElementsByY(selectedElementsOriginal);
};
