import { GridElement } from 'types';

const predicate = (id: string | number, family?: string) => (element: GridElement) => {
  if (element.id === id) return true;
  if (family && element.family === family) return true;
  return false;
};

const getSelectedElements = (
  currentElements: GridElement[],
  id: string | number,
  family: string | undefined,
) => currentElements.filter(predicate(id, family));

export default getSelectedElements;
