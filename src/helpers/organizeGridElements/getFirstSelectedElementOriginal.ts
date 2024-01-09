import { GridElement } from 'types';
import { getSelectedElementsOriginal } from './getSelectedElementsOriginal';

export const getFirstSelectedElementOriginal = (
  selectedElements: GridElement[],
  startingElements: GridElement[],
): GridElement | null => {
  const selectedElementsOriginal = getSelectedElementsOriginal(selectedElements, startingElements);
  return selectedElementsOriginal.length ? selectedElementsOriginal[0] : null;
};
