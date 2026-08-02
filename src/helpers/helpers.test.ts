import { describe, expect, it } from 'vitest';

import { GridElement } from 'types';
import {
  GRID_HEIGHT_MULTIPLIER_WHEN_AUTO,
  GRID_MIN_HEIGHT_WHEN_AUTO,
  ROWS_MIN_COUNT_WHEN_AUTO,
} from '@/consts';
import calculatePixelsByCellPosition from './calculatePixelsByCellPosition';
import copyElements from './copyElements';
import getElementBottomInPixels from './getElementBottomInPixels';
import getGridBottomInPixels from './getGridBottomInPixels';
import getInternalRows from './getInternalRows';
import getLowestElementBottomInPixels from './getLowestElementBottomInPixels';
import getSelectedElements from './getSelectedElements';
import { isLengthAuto } from './isLengthAuto';

const element = (props: Partial<GridElement>): GridElement => ({
  x: 0, y: 0, w: 1, h: 1, render: () => null, ...props,
} as GridElement);

const measureElementHeight = (item: GridElement) => (item.h === 'auto' ? 1 : item.h as number);

describe('isLengthAuto', () => {
  it('returns true only for "auto"', () => {
    expect(isLengthAuto('auto')).toBe(true);
    expect(isLengthAuto(0)).toBe(false);
    expect(isLengthAuto(10)).toBe(false);
  });
});

describe('copyElements', () => {
  it('creates a shallow copy of every element', () => {
    const elements = [element({ id: 'a' }), element({ id: 'b' })];
    const copy = copyElements(elements);

    expect(copy).toStrictEqual(elements);
    expect(copy[0]).not.toBe(elements[0]);

    copy[0].x = 99;
    expect(elements[0].x).toBe(0);
  });
});

describe('getSelectedElements', () => {
  const elements = [
    element({ id: 'a', family: 'one' }),
    element({ id: 'b', family: 'one' }),
    element({ id: 'c', family: 'two' }),
  ];

  it('picks the element matching the id', () => {
    expect(getSelectedElements(elements, 'c', undefined)).toStrictEqual([elements[2]]);
  });

  it('picks every element of the given family', () => {
    expect(getSelectedElements(elements, 'a', 'one')).toStrictEqual([elements[0], elements[1]]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(getSelectedElements(elements, 'missing', 'missing')).toStrictEqual([]);
  });
});

describe('calculatePixelsByCellPosition', () => {
  it('calculates x and y with gaps and padding', () => {
    expect(calculatePixelsByCellPosition(element({ x: 2, y: 3 }), {
      gapHorizontal: 10,
      gapVertical: 5,
      paddingLeft: 7,
      paddingTop: 3,
      rowHeight: 20,
      colWidth: 50,
    })).toStrictEqual({ x: 2 * 50 + 2 * 10 + 7, y: 3 * 20 + 3 * 5 + 3 });
  });

  it('falls back to defaults for optional options', () => {
    expect(calculatePixelsByCellPosition(element({ x: 2, y: 3 }), {
      rowHeight: 20,
      colWidth: 50,
    })).toStrictEqual({ x: 100, y: 60 });
  });

  it('returns x: 0 while the column width is still unknown', () => {
    expect(calculatePixelsByCellPosition(element({ x: 2, y: 3 }), {
      rowHeight: 20,
      colWidth: 'auto',
    })).toStrictEqual({ x: 0, y: 60 });
  });
});

describe('getElementBottomInPixels', () => {
  it('returns the bottom of the element in pixels', () => {
    expect(getElementBottomInPixels({
      element: element({ y: 2, h: 3 }),
      measureElementHeight,
      rowHeight: 20,
      gapVertical: 10,
    })).toBe(2 * 30 + 3 * 30 - 10);
  });
});

describe('getLowestElementBottomInPixels', () => {
  it('returns the biggest bottom of all elements', () => {
    expect(getLowestElementBottomInPixels({
      elements: [element({ y: 0, h: 1 }), element({ y: 5, h: 2 }), element({ y: 1, h: 1 })],
      gapVertical: 10,
      measureElementHeight,
      rowHeight: 20,
    })).toBe(5 * 30 + 2 * 30 - 10);
  });

  it('returns 0 without elements', () => {
    expect(getLowestElementBottomInPixels({
      elements: [],
      gapVertical: 10,
      measureElementHeight,
      rowHeight: 20,
    })).toBe(0);
  });
});

describe('getGridBottomInPixels', () => {
  it('uses the fixed rows count when rows is a number', () => {
    expect(getGridBottomInPixels({
      elements: [],
      gapVertical: 10,
      measureElementHeight,
      rows: 4,
      rowHeight: 20,
    })).toBe(4 * 30 - 10);
  });

  it('falls back to the minimum height when rows is auto', () => {
    expect(getGridBottomInPixels({
      elements: [element({ y: 0, h: 1 })],
      gapVertical: 10,
      measureElementHeight,
      rows: 'auto',
      rowHeight: 20,
    })).toBe(GRID_MIN_HEIGHT_WHEN_AUTO);
  });

  it('grows past the minimum height for elements far below', () => {
    const elements = [element({ y: 1000, h: 1 })];

    expect(getGridBottomInPixels({
      elements,
      gapVertical: 10,
      measureElementHeight,
      rows: 'auto',
      rowHeight: 20,
    })).toBe(getLowestElementBottomInPixels({
      elements, gapVertical: 10, measureElementHeight, rowHeight: 20,
    }) * GRID_HEIGHT_MULTIPLIER_WHEN_AUTO);
  });
});

describe('getInternalRows', () => {
  it('returns the given rows count when it is a number', () => {
    expect(getInternalRows({ elements: [], measureElementHeight, rows: 7 })).toBe(7);
  });

  it('returns the minimum rows count when rows is auto', () => {
    expect(getInternalRows({
      elements: [element({ y: 2, h: 1 })],
      measureElementHeight,
      rows: 'auto',
    })).toBe(ROWS_MIN_COUNT_WHEN_AUTO);
  });

  it('doubles the lowest element position when it exceeds the minimum', () => {
    expect(getInternalRows({
      elements: [element({ y: 1, h: 1 }), element({ y: ROWS_MIN_COUNT_WHEN_AUTO, h: 2 })],
      measureElementHeight,
      rows: 'auto',
    })).toBe((ROWS_MIN_COUNT_WHEN_AUTO + 2) * 2);
  });
});
