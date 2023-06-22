import { describe, expect, it, vi } from 'vitest'

import { GridElement } from 'types'
import { sortElements } from './sortElements'

const elementA: GridElement = {
  h: 1,
  render: null,
  w: 2,
  x: 3,
  y: 4,
}

const elementB: GridElement = {
  h: 1,
  render: null,
  w: 3,
  x: 2,
  y: 3,
}

const elementC: GridElement = {
  h: 2,
  render: null,
  w: 4,
  x: 5,
  y: 3,
}

const elementD: GridElement = {
  ...elementC,
}

const elementE: GridElement = {
  id: 'ee',
  h: 3,
  render: null,
  w: 1,
  x: 1,
  y: 5,
}

const elementF: GridElement = {
  id: 'ff',
  h: 3,
  render: null,
  w: 2,
  x: 3,
  y: 1,
}

const elementG: GridElement = {
  id: 'gg',
  h: 1,
  render: null,
  w: 5,
  x: 0,
  y: 0,
}

const elementH: GridElement = {
  id: 'hh',
  h: 5,
  render: null,
  w: 1,
  x: 0,
  y: 8,
}

describe('useCalculateCellPositionByPixels', () => { 
  it('should sort elements without id', () => {
    expect(sortElements([elementA, elementB])).toStrictEqual([elementB, elementA])
    expect(sortElements([elementB, elementA])).toStrictEqual([elementB, elementA])
    expect(sortElements([elementA, elementB, elementC])).toStrictEqual([
      elementB, elementC, elementA,
    ])
    expect(sortElements([elementC, elementB])).toStrictEqual([
      elementB, elementC,
    ])
    expect(sortElements([elementC, elementD])).toStrictEqual([elementC, elementD])
    expect(sortElements([elementD, elementC])).toStrictEqual([elementD, elementC])
    expect(sortElements([
      elementD, elementC, elementB, elementA,
    ])).toStrictEqual([
      elementB, elementD, elementC, elementA,
    ])
    expect(sortElements([
      elementA, elementB, elementC, elementD, elementE,
    ])).toStrictEqual([
      elementE, elementB, elementC, elementD, elementA,
    ])
  })

  it('should sort elements', () => {
    expect(sortElements([
      elementA,
      elementB,
      elementC,
      elementD,
      elementE,
      elementF,
      elementG,
      elementH,
    ])).toStrictEqual([
      elementE,
      elementF,
      elementG,
      elementH,
      elementB,
      elementC,
      elementD,
      elementA,
    ])
  })
})
