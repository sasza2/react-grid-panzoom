import { describe, expect, it } from 'vitest';

import { GridElement } from 'types';
import { appendElementToMap } from './appendElementToMap';
import { areElementsOnSameVerticalLine } from './areElementsOnSameVerticalLine';
import { createHorizontalMovement } from './createHorizontalMovement';
import { createMap } from './createMap';
import { getFirstSelectedElement } from './getFirstSelectedElement';
import { getFirstSelectedElementOriginal } from './getFirstSelectedElementOriginal';
import { getSelectedElementsIds } from './getSelectedElementsIds';
import { getSelectedElementsOriginal } from './getSelectedElementsOriginal';
import { isTryingToMoveAboveLowest } from './isTryingToMoveAboveLowest';
import { sortElementsByY } from './sortElementsByY';
import { startingElementsWithoutSelected } from './startingElementsWithoutSelected';
import { toNextElements } from './toNextElements';

const el = (props: Partial<GridElement>): GridElement => ({
  x: 0, y: 0, w: 1, h: 1, render: () => null, ...props,
} as GridElement);

const measureElementHeight = (item: GridElement) => item.h as number;

describe('getSelectedElementsIds', () => {
  it('maps elements to their ids', () => {
    expect(getSelectedElementsIds([el({ id: 'a' }), el({ id: 2 })])).toStrictEqual(['a', 2]);
  });
});

describe('startingElementsWithoutSelected', () => {
  it('drops the selected elements', () => {
    const a = el({ id: 'a' });
    const b = el({ id: 'b' });
    expect(startingElementsWithoutSelected([a, b], [a])).toStrictEqual([b]);
  });
});

describe('sortElementsByY', () => {
  it('sorts by y, then by x', () => {
    const a = el({ id: 'a', x: 1, y: 1 });
    const b = el({ id: 'b', x: 0, y: 1 });
    const c = el({ id: 'c', x: 5, y: 0 });

    expect(sortElementsByY([a, b, c])).toStrictEqual([c, b, a]);
  });

  it('puts a disabled element first, whichever side it is on', () => {
    const disabled = el({ id: 'disabled', y: 9, disabled: true });
    const disabledMove = el({ id: 'disabledMove', y: 9, disabledMove: true });
    const normal = el({ id: 'normal', y: 0 });

    expect(sortElementsByY([normal, disabled])).toStrictEqual([disabled, normal]);
    expect(sortElementsByY([disabledMove, normal])).toStrictEqual([disabledMove, normal]);
  });
});

describe('getFirstSelectedElement', () => {
  it('returns the topmost selected element without mutating the input', () => {
    const a = el({ id: 'a', y: 5 });
    const b = el({ id: 'b', y: 1 });
    const selected = [a, b];

    expect(getFirstSelectedElement(selected)).toBe(b);
    expect(selected).toStrictEqual([a, b]);
  });
});

describe('getSelectedElementsOriginal', () => {
  it('resolves the selected elements against their starting positions', () => {
    const startingA = el({ id: 'a', y: 3 });
    const startingB = el({ id: 'b', y: 1 });

    expect(getSelectedElementsOriginal(
      [el({ id: 'a', y: 0 }), el({ id: 'b', y: 0 }), el({ id: 'gone', y: 0 })],
      [startingA, startingB],
    )).toStrictEqual([startingB, startingA]);
  });
});

describe('getFirstSelectedElementOriginal', () => {
  it('returns the first original element', () => {
    const starting = el({ id: 'a', y: 3 });
    expect(getFirstSelectedElementOriginal([el({ id: 'a', y: 0 })], [starting])).toBe(starting);
  });

  it('returns null when no selected element exists in the starting elements', () => {
    expect(getFirstSelectedElementOriginal([el({ id: 'a' })], [])).toBeNull();
    expect(getFirstSelectedElementOriginal([], [el({ id: 'a' })])).toBeNull();
  });
});

describe('createMap / appendElementToMap', () => {
  it('fills every cell covered by the element', () => {
    const element = el({ id: 'a', x: 1, y: 2, w: 2, h: 2 });
    const map = createMap([element], measureElementHeight);

    expect(Object.keys(map).sort()).toStrictEqual(['1_2', '1_3', '2_2', '2_3']);
    expect(map['1_2']).toStrictEqual({ element, startX: 1, startY: 2 });
    expect(map['2_3']).toBe(map['1_2']);
  });

  it('applies the offsets to the stored start position', () => {
    const element = el({ id: 'a', x: 1, y: 1 });
    const map = {};
    appendElementToMap(map, element, measureElementHeight, 2, 3);

    expect(map).toStrictEqual({ '3_4': { element, startX: 3, startY: 4 } });
  });
});

describe('toNextElements', () => {
  it('returns the selected element as-is, keeps unmoved ones and rewrites moved ones', () => {
    const unmoved = el({ id: 'unmoved', x: 0, y: 0 });
    const moved = el({ id: 'moved', x: 1, y: 1 });
    const selectedOriginal = el({ id: 'selected', x: 2, y: 2 });
    const selected = el({ id: 'selected', x: 3, y: 3 });

    const map = {};
    appendElementToMap(map, unmoved, measureElementHeight);
    appendElementToMap(map, moved, measureElementHeight, 0, 4);
    appendElementToMap(map, selectedOriginal, measureElementHeight);

    const result = toNextElements(map, [selected]);

    expect(result).toStrictEqual([
      unmoved,
      { ...moved, x: 1, y: 5 },
      selected,
    ]);
    expect(result[0]).toBe(unmoved);
    expect(result[2]).toBe(selected);
  });
});

describe('areElementsOnSameVerticalLine', () => {
  it('detects overlapping column ranges', () => {
    expect(areElementsOnSameVerticalLine(
      [el({ x: 0, w: 2 })],
      [el({ x: 1, w: 1 })],
    )).toBe(true);
  });

  it('returns false for disjoint column ranges', () => {
    expect(areElementsOnSameVerticalLine(
      [el({ x: 0, w: 1 })],
      [el({ x: 1, w: 1 })],
    )).toBe(false);
  });
});

describe('isTryingToMoveAboveLowest', () => {
  const element = el({ id: 'element', x: 0, y: 5 });

  it('returns true when nothing above has been placed yet', () => {
    const above = new Map([[1, [el({ id: 'above', x: 0, y: 1 })]]]);
    expect(isTryingToMoveAboveLowest(above, new Map(), element, -3)).toBe(true);
  });

  it('returns false when an element above already sits below the target line', () => {
    const above = new Map([[1, [el({ id: 'above', x: 0, y: 1 })]]]);
    const below = new Map<string | number, number>([['above', 4]]);
    expect(isTryingToMoveAboveLowest(above, below, element, -3)).toBe(false);
  });

  it('ignores elements on the same row and on another vertical line', () => {
    const above = new Map([
      [5, [el({ id: 'sameRow', x: 0, y: 5 })]],
      [9, [el({ id: 'belowRow', x: 0, y: 9 })]],
      [1, [el({ id: 'otherColumn', x: 3, y: 1 })]],
    ]);
    const below = new Map<string | number, number>([
      ['sameRow', 99], ['belowRow', 99], ['otherColumn', 99],
    ]);
    expect(isTryingToMoveAboveLowest(above, below, element, -3)).toBe(true);
  });
});

describe('createHorizontalMovement', () => {
  const build = (
    map: Record<string, unknown>,
    selectedElements: GridElement[],
    startingElements: GridElement[],
    cols = 4,
  ) => createHorizontalMovement({
    cols,
    map: map as never,
    measureElementHeight,
    selectedElements,
    startingElements,
  });

  it('returns null when there is no free spot on either side', () => {
    const blockers = [
      el({ id: 'b0', x: 0, y: 0 }),
      el({ id: 'b1', x: 1, y: 0 }),
      el({ id: 'b2', x: 2, y: 0 }),
      el({ id: 'b3', x: 3, y: 0 }),
    ];
    const map = createMap(blockers, measureElementHeight);
    const { tryToMoveHorizontal, tryToMoveLeft, tryToMoveRight } = build(map, [], []);

    const element = el({ id: 'element', x: 2, y: 0 });
    expect(tryToMoveLeft(element)).toBeNull();
    expect(tryToMoveRight(element)).toBeNull();
    expect(tryToMoveHorizontal(element)).toBeNull();
  });

  it('returns the only free side when the other one is blocked', () => {
    const map = createMap([
      el({ id: 'b0', x: 0, y: 0 }),
      el({ id: 'b1', x: 1, y: 0 }),
    ], measureElementHeight);
    const { tryToMoveHorizontal } = build(map, [], []);

    expect(tryToMoveHorizontal(el({ id: 'element', x: 1, y: 0 }))).toBe(1);
  });

  it('prefers the closer side', () => {
    const map = createMap([el({ id: 'b', x: 0, y: 0, w: 2 })], measureElementHeight);
    const { tryToMoveHorizontal } = build(map, [], []);

    expect(tryToMoveHorizontal(el({ id: 'element', x: 1, y: 0 }))).toBe(1);
  });

  it('breaks an equal distance tie using the direction of the drag', () => {
    const map = createMap([el({ id: 'b', x: 2, y: 0 })], measureElementHeight);
    const starting = [el({ id: 'selected', x: 0, y: 5 })];

    // dragged to the right, so the blocked element gives way to the left
    const movedRight = build(map, [el({ id: 'selected', x: 3, y: 5 })], starting);
    expect(movedRight.tryToMoveHorizontal(el({ id: 'element', x: 2, y: 0 }))).toBe(-1);

    // dragged to the left, so the blocked element gives way to the right
    const movedLeft = build(map, [el({ id: 'selected', x: 0, y: 5 })], [
      el({ id: 'selected', x: 3, y: 5 }),
    ]);
    expect(movedLeft.tryToMoveHorizontal(el({ id: 'element', x: 2, y: 0 }))).toBe(1);
  });
});
