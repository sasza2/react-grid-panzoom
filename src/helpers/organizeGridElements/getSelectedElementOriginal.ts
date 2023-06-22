import { GridElement } from 'types';
import { getFirstSelectedElement } from './getFirstSelectedElement';

export const getSelectedElementOriginal = (
  selectedElements: GridElement[],
  startingElements: GridElement[],
): GridElement | null => {
  if (selectedElements.length) {
    const firstSelectedElement = getFirstSelectedElement(selectedElements);
    const selectedElementOriginal = startingElements.find(
      (element) => element.id === firstSelectedElement.id,
    );
    return selectedElementOriginal || null;
  }

  return null;
};
