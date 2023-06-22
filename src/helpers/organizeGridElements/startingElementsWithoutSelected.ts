import { GridElement } from 'types';
import { getSelectedElementsIds } from './getSelectedElementsIds';

export const startingElementsWithoutSelected = (
  currentElements: Array<GridElement>,
  selectedElements: Array<GridElement>,
): Array<GridElement> => {
  const selectedElementsIds = getSelectedElementsIds(selectedElements);
  return currentElements.filter((element) => !selectedElementsIds.includes(element.id));
};
