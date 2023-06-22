import { describe, expect, it } from 'vitest'

import { GridElement, MeasureElementHeight } from 'types'
import { loopInMap } from './loopInMap'
import { ElementWrapped } from './types'

describe('organize grid elements - loop elements', () => {
  it('should assing valid element to map', () => {
    const element: GridElement = {
      h: 'auto',
      render: null,
      w: 3,
      x: 2,
      y: 5,
      id: 'test',
    }

    const map: Record<string, ElementWrapped> = {}

    const callback = (x: number, y: number, startX: number, startY: number) => {
      map[`${x}_${y}`] = { element, startX, startY }
    }

    const measureElementHeight: MeasureElementHeight = () => 5

    const offsetX = 6
    const offsetY = 10
    loopInMap(element, offsetX, offsetY, callback, measureElementHeight)

    const expectedMap: Record<string, ElementWrapped> = {}
    const fromX = element.x + offsetX
    const fromY = element.y + offsetY
    const height = measureElementHeight(element)

    for (let x = fromX; x < fromX + element.w; x++) {
      for (let y = fromY; y < fromY + height; y++) {
        expectedMap[`${x}_${y}`] = { element, startX: fromX, startY: fromY };
      }
    }
    
    expect(map).toStrictEqual(expectedMap)
  })
})
