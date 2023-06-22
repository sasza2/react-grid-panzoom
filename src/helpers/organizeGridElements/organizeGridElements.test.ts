import { describe, expect, it } from 'vitest'

import { GridElement } from 'types'
import {
  defaultOrganizeGridElements,
  organizeGridElementsWithBringUp,
} from './organizeGridElements'
import { isLengthAuto } from '../isLengthAuto';

describe('organize grid elements', async () => {
  const examplesCount = 68;
  for (let i = 1; i <= examplesCount; i++) {
    const id = `00${i}`
    const name = id.substring(id.length - 3, id.length)
    it(`organize grid elements, example ${name}`, async () => {
      const testCheckFile = checkFile(name)
      await testCheckFile
      debugger
    })
  }
})

async function checkFile(name: string) {
  const { default: content } = await loadFile(name) as unknown as { default: string };

  const {
    cols,
    result,
    removeEmptySpaceBelow,
    rows,
    startingElements,
    selectedElements,
  } = createTestData(content);

  const measureElementHeight = (gridElement: GridElement): number => {
    return gridElement.h as number
  }

  const organizeGridElements = removeEmptySpaceBelow
    ? organizeGridElementsWithBringUp
    : defaultOrganizeGridElements

  const resultFromOrganizer = organizeGridElements({
    cols,
    rows,
    startingElements,
    selectedElements,
    measureElementHeight,
  })

  expect(resultFromOrganizer.length).toStrictEqual(result.length)
  result.forEach(item => {
    const itemFromOrganizer = resultFromOrganizer.find(itemOrganizer => itemOrganizer.id === item.id)
    expect(item).toStrictEqual(itemFromOrganizer)
  })
}

async function loadFile(name: string) {
  const content = await import(`./examples/${name}.txt?raw`);
  return content as string
}

type TestData = {
  startingElements: GridElement[],
  selectedElements: GridElement[],
  removeEmptySpaceBelow: boolean,
  result: GridElement[],
  rows: 'auto' | number,
  cols: number,
}

function createTestData(file: string): TestData {
  const lines: string[] = file.split(/\r?\n/);

  const testData: TestData = {
    startingElements: [],
    selectedElements: [],
    removeEmptySpaceBelow: false,
    result: [],
    rows: 1,
    cols: 1,
  }

  let cutIndex = 1
  let selectedArray: GridElement[] = testData.startingElements

  const splitFile = () => {
    const elementX = new Map<string, number>();
    const elementY = new Map<string, number>();
    const elementXW = new Map<string, number>();
    const elementYH = new Map<string, number>();

    const appendTest = () => {
      elementX.forEach((value, key) => {
        const x = elementX.get(key);
        const y = elementY.get(key) - cutIndex;
        const w = elementXW.get(key) - x + 1
        const h = (elementYH.get(key) - cutIndex) - y + 1
        const element = {
          id: key, x, y, w, h
        } as GridElement
        selectedArray.push(element)
      })

      elementX.clear()
      elementY.clear()
      elementXW.clear()
      elementYH.clear()
    }

    for (let y = 0; y < lines.length; y++) {
      const line = lines[y];
      if (!line || !line.trim()) continue
      if (line.startsWith('removeEmptySpaceBelow:')) {
        cutIndex++
        const value = line.trim().split(' ').pop()
        if (value === 'true') testData.removeEmptySpaceBelow = true
        continue
      }
      if (line.startsWith('rows:')) {
        cutIndex++
        const value = line.trim().split(' ').pop()
        if (isLengthAuto(value as 'auto')) testData.rows = 'auto'
        continue
      }
      if (line.startsWith('starting:')) continue
      if (line.startsWith('selected:')) {
        appendTest()
        selectedArray = testData.selectedElements
        cutIndex = y + 1
        continue
      }
      if (line.startsWith('result:')) {
        appendTest()
        selectedArray = testData.result
        cutIndex = y + 1
        if (!isLengthAuto(testData.rows)) testData.rows = lines.length - cutIndex
        continue
      }


      for (let x = 0; x < line.length; x++) {
        const char = line[x];
        if (char === '|') break

        if (x + 1 > testData.cols) testData.cols = x + 1

        if (char === ' ') continue

        if (!elementX.has(char)) {
          elementX.set(char, x);
        }
        if (!elementY.has(char)) {
          elementY.set(char, y);
        }

        elementXW.set(char, x);
        elementYH.set(char, y);
      }
    }

    appendTest()
  }

  splitFile()
  
  return testData
}
