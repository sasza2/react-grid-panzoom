import { GridElement } from 'types';
import { sortElementsByY } from './sortElementsByY';

export const getFirstSelectedElement = (selectedElements: GridElement[]): GridElement => {
  const [firstSelectedElement] = sortElementsByY([...selectedElements]);
  return firstSelectedElement;
};
