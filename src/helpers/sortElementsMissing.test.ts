import { describe, expect, it } from 'vitest';

import { GridElement } from 'types';
import { sortElements } from './sortElements';

const withoutId: GridElement = {
  h: 1, render: null, w: 1, x: 0, y: 0,
};

const withId: GridElement = {
  id: 'a', h: 1, render: null, w: 1, x: 0, y: 0,
};

describe('sortElements — elements without an id', () => {
  it('pushes an element without an id after one with an id', () => {
    expect(sortElements([withoutId, withId])).toStrictEqual([withId, withoutId]);
  });

  it('keeps an element with an id before one without', () => {
    expect(sortElements([withId, withoutId])).toStrictEqual([withId, withoutId]);
  });

  it('does not mutate the given array', () => {
    const elements = [withoutId, withId];
    sortElements(elements);
    expect(elements).toStrictEqual([withoutId, withId]);
  });
});
