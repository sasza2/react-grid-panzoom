import { describe, expect, it } from 'vitest'

import { GridElement } from 'types'
import { sortElementsByY } from './sortElementsByY'

describe('organize grid elements - sort elements by y', () => {
  it('should sort elements', () => {
    const elementA: GridElement = {
      x: 0,
      y: 2,
      render: null,
    }

    const elementB: GridElement = {
      x: 2,
      y: 0,
      render: null,
    }

    const elementC: GridElement = {
      x: 0,
      y: 1,
      render: null,
    }

    expect(sortElementsByY([
      elementA,
      elementB,
      elementC,
    ])).toStrictEqual([elementB, elementC, elementA])
  })

  it ('should sort elements on same y level', () => {
    const elementA: GridElement = {
      x: 4,
      y: 2,
      render: null,
    }

    const elementB: GridElement = {
      x: 2,
      y: 2,
      render: null,
    }

    const elementC: GridElement = {
      x: 3,
      y: 2,
      render: null,
    }

    expect(sortElementsByY([
      elementA,
      elementB,
      elementC,
    ])).toStrictEqual([elementB, elementC, elementA])
  })

  it('should sort disabled elements', () => {
    const elementA: GridElement = {
      x: 0,
      y: 2,
      render: null,
    }

    const elementB: GridElement = {
      x: 2,
      y: 0,
      render: null,
    }

    const elementC: GridElement = {
      x: 3,
      y: 1,
      render: null,
      disabledMove: true,
    }

    const elementD: GridElement = {
      x: 1,
      y: 1,
      render: null,
      disabledMove: true,
    }

    const elementE: GridElement = {
      x: 0,
      y: 0,
      render: null,
      disabledMove: true,
    }

    expect(sortElementsByY([
      elementA,
      elementB,
      elementC,
      elementD,
      elementE,
    ])).toStrictEqual([elementE, elementD, elementC, elementB, elementA])
  })
})
