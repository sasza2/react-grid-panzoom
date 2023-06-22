import { GridElement } from 'types';

export const areElementsOnSameVerticalLine = (
  elementA: GridElement,
  elementB: GridElement,
): boolean => {
  const tab: Record<number, number> = {};
  for (let { x } = elementA; x < elementA.x + elementA.w; x++) tab[x] = 1;

  for (let { x } = elementB; x < elementB.x + elementB.w; x++) {
    if (tab[x]) return true;
  }

  return false;
};
