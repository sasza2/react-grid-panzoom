import { describe, expect, it } from 'vitest';

import { GridElement } from 'types';
import { createMap } from './createMap';
import { createVerticalMovement } from './createVerticalMovement';
import { defaultOrganizeGridElements, organizeGridElementsWithBringUp } from './organizeGridElements';

const el = (props: Partial<GridElement>): GridElement => ({
  x: 0, y: 0, w: 1, h: 1, render: () => null, ...props,
} as GridElement);

const measureElementHeight = (item: GridElement) => item.h as number;

const blockers = (cells: Array<[number, number]>) => createMap(
  cells.map(([x, y], index) => el({ id: `blocker-${index}`, x, y })),
  measureElementHeight,
);

describe('organizeGridElements — elements that cannot move', () => {
  it('keeps a disabled element exactly where it is', () => {
    const disabled = el({
      id: 'disabled', x: 1, y: 1, disabled: true,
    });
    const selected = el({ id: 'selected', x: 0, y: 0 });

    const result = defaultOrganizeGridElements({
      startingElements: [selected, disabled],
      cols: 3,
      rows: 3,
      measureElementHeight,
      selectedElements: [selected],
    });

    expect(result).toHaveLength(2);
    expect(result.find((item) => item.id === 'disabled')).toStrictEqual(disabled);
  });

  it('drops an element that cannot move out of the way of the selection', () => {
    const disabled = el({
      id: 'disabled', x: 0, y: 0, disabledMove: true,
    });
    const selected = el({ id: 'selected', x: 0, y: 0 });

    const result = defaultOrganizeGridElements({
      startingElements: [selected, disabled],
      cols: 1,
      rows: 1,
      measureElementHeight,
      selectedElements: [selected],
    });

    // the disabled element collides with the selection, so the move is rejected
    expect(result).toHaveLength(1);
  });
});

describe('organizeGridElements — the fallback search', () => {
  it('rejects the move when there is no free cell at all', () => {
    const selected = el({ id: 'selected', x: 0, y: 0 });
    const other = el({ id: 'other', x: 0, y: 0 });

    const result = defaultOrganizeGridElements({
      startingElements: [selected, other],
      cols: 1,
      rows: 1,
      measureElementHeight,
      selectedElements: [selected],
    });

    expect(result).toHaveLength(1);
  });

  it('finds a free cell in another column when the row and column are full', () => {
    // the selection covers (0,0), (0,1) and (1,0), leaving only (1,1)
    const selectedTall = el({
      id: 'selectedTall', x: 0, y: 0, w: 1, h: 2,
    });
    const selectedWide = el({ id: 'selectedWide', x: 1, y: 0 });
    const pushed = el({ id: 'pushed', x: 0, y: 0 });

    const result = organizeGridElementsWithBringUp({
      startingElements: [selectedTall, selectedWide, pushed],
      cols: 2,
      rows: 2,
      measureElementHeight,
      selectedElements: [selectedTall, selectedWide],
    });

    expect(result).toHaveLength(3);
    expect(result.find((item) => item.id === 'pushed')).toStrictEqual({
      ...pushed, x: 1, y: 1,
    });
  });
});

describe('createVerticalMovement — moving above the first selected element', () => {
  it('will not lift an element past the row the selection was dragged to', () => {
    // the selection was dragged up from row 5 to row 2
    const selectedOriginal = el({ id: 'selected', x: 0, y: 5 });
    const selected = el({ id: 'selected', x: 0, y: 2 });
    const element = el({ id: 'element', x: 0, y: 8 });

    const { tryToMoveVertical } = createVerticalMovement({
      internalRows: 10,
      // rows 6, 7 and 8 are taken, so the scan lands on row 5
      map: blockers([[0, 6], [0, 7], [0, 8]]),
      measureElementHeight,
      removeEmptySpaceBelow: true,
      selectedElements: [selected],
      startingElements: [selectedOriginal, element],
    });

    // row 5 would still be below the dragged selection (row 2), so the element
    // settles on the first free row instead of being lifted any further
    expect(tryToMoveVertical(element)).toBe(-3);
  });

  it('will not lift an element above one that was already pushed down', () => {
    // the selection was dragged down from row 3 to row 9
    const selectedOriginal = el({ id: 'selected', x: 1, y: 3 });
    const selected = el({ id: 'selected', x: 1, y: 9 });
    // this one spans both columns, so it shares a vertical line with `element`
    const wide = el({
      id: 'wide', x: 0, y: 1, w: 2, h: 1,
    });
    const element = el({ id: 'element', x: 1, y: 12 });

    const { tryToMoveVertical } = createVerticalMovement({
      internalRows: 20,
      map: blockers([
        // column 0 keeps `wide` from settling above row 6
        [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
        // column 1 keeps `element` from settling above row 7
        [1, 8], [1, 9], [1, 10], [1, 11], [1, 12],
      ]),
      measureElementHeight,
      removeEmptySpaceBelow: true,
      selectedElements: [selected],
      startingElements: [selectedOriginal, wide, element],
    });

    // `wide` settles on row 6 first
    expect(tryToMoveVertical(wide)).toBe(5);

    // so `element` may not jump above it and stays on the first free row
    expect(tryToMoveVertical(element)).toBe(-5);
  });
});

describe('organizeGridElements — the fallback keeps elements from jumping up', () => {
  it('skips free cells above the row the previous element landed on', () => {
    // the selection blocks column 0 completely, plus rows 1 and 3, leaving only
    // (2,0), (1,2) and (2,2) free
    const selectedElements = [
      el({ id: 'column', x: 0, y: 0, w: 1, h: 4 }),
      el({ id: 'topLeft', x: 1, y: 0, w: 1, h: 2 }),
      el({ id: 'middle', x: 2, y: 1, w: 1, h: 1 }),
      el({ id: 'bottom', x: 1, y: 3, w: 2, h: 1 }),
    ];

    const first = el({ id: 'first', x: 0, y: 1 });
    const second = el({ id: 'second', x: 0, y: 3 });

    const result = defaultOrganizeGridElements({
      startingElements: [...selectedElements, first, second],
      cols: 3,
      rows: 4,
      measureElementHeight,
      selectedElements,
    });

    expect(result).toHaveLength(6);
    expect(result.find((item) => item.id === 'first')).toStrictEqual({
      ...first, x: 1, y: 2,
    });
    // (2,0) is free, but it sits above where `first` landed, so it is skipped
    expect(result.find((item) => item.id === 'second')).toStrictEqual({
      ...second, x: 2, y: 2,
    });
  });
});

describe('createVerticalMovement — choosing between up and down', () => {
  const build = (map: ReturnType<typeof blockers>) => {
    const selected = el({ id: 'selected', x: 2, y: 0 });
    return createVerticalMovement({
      internalRows: 10,
      map,
      measureElementHeight,
      removeEmptySpaceBelow: false,
      selectedElements: [selected],
      startingElements: [selected, el({ id: 'element', x: 0, y: 5 })],
    });
  };

  it('moves down when the free row above is further away', () => {
    const { tryToMoveVertical } = build(blockers([[0, 4], [0, 5]]));
    // two rows up versus one row down
    expect(tryToMoveVertical(el({ id: 'element', x: 0, y: 5 }))).toBe(1);
  });

  it('moves up when the free row below is further away', () => {
    const { tryToMoveVertical } = build(blockers([[0, 5], [0, 6], [0, 7]]));
    // one row up versus three rows down
    expect(tryToMoveVertical(el({ id: 'element', x: 0, y: 5 }))).toBe(-1);
  });
});
