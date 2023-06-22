import { describe, expect, it } from 'vitest'

import { GridElement, MeasureElementHeight } from 'types'
import { hasAnyCollisions } from './hasAnyCollisions';
import { createMap } from './createMap';

describe('organize grid elements - collisions', () => {
  it('should return collision elements', () => {
    const elementA: GridElement = {
      id: 'a',
      x: 0,
      y: 1,
      w: 2,
      h: 4,
      render: null,
    }

    const elementB: GridElement = {
      id: 'b',
      x: 3,
      y: 2,
      w: 2,
      h: 3,
      render: null,
    }

    const elementC: GridElement = {
      id: 'c',
      x: 2,
      y: 1,
      h: 5,
      w: 1,
      render: null,
    }

    const measureElementHeight: MeasureElementHeight = (element) => element.h as number

    const map = createMap([elementA, elementB], measureElementHeight);
    let collisions = hasAnyCollisions(map, elementC, measureElementHeight)
    expect(collisions).toStrictEqual([])

    elementC.x = 1
    collisions = hasAnyCollisions(map, elementC, measureElementHeight)
    expect(collisions).toStrictEqual([{ element: elementA, startX: 0, startY: 1 }])

    elementC.w = 3
    collisions = hasAnyCollisions(map, elementC, measureElementHeight)
    expect(collisions).toStrictEqual([
      { element: elementA, startX: 0, startY: 1 },
      { element: elementB, startX: 3, startY: 2 },
    ])
  });
});
