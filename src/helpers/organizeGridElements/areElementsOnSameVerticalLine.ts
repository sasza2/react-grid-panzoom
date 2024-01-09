import { GridElement } from 'types';

const getMinX = (elements: GridElement[]): number => {
  const numbers = elements.map((element) => element.x);
  return Math.min(...numbers);
};

const getMaxX = (elements: GridElement[]): number => {
  const numbers = [...elements.map((element) => element.x + element.w)];
  return Math.max(...numbers);
};

const getRange = (elements: GridElement[]): [number, number] => {
  const minX = getMinX(elements);
  const maxX = getMaxX(elements);
  return [minX, maxX];
};

export const areElementsOnSameVerticalLine = (
  elementsA: GridElement[],
  elementsB: GridElement[],
): boolean => {
  const tab: Record<number, number> = {};

  const [minXA, maxXA] = getRange(elementsA);
  for (let x = minXA; x < maxXA; x++) tab[x] = 1;

  const [minXB, maxXB] = getRange(elementsB);
  for (let x = minXB; x < maxXB; x++) {
    if (tab[x]) return true;
  }

  return false;
};
