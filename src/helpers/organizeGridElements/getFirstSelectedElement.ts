import { GridElement } from 'types';

export const getFirstSelectedElement = (selectedElements: GridElement[]): GridElement => {
  const [firstSelectedElement] = selectedElements;
  return firstSelectedElement;
};
