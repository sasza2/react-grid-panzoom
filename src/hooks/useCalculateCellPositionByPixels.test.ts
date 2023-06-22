import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react-hooks'

import useCalculateCellPositionByPixels from './useCalculateCellPositionByPixels'

vi.mock('./useGrid')

describe('useCalculateCellPositionByPixels', () => { 
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return valid grid positions by pixels', () => {
    vi.mock('./useGrid', () => ({
      useGrid: () => ({
        colWidth: 50,
        gapHorizontal: 10,
        gapVertical: 10,
        rowHeight: 15,
        paddingLeft: 30,
        paddingRight: 40,
      }),
    }))

    let hook = renderHook(() => {
      const hook = useCalculateCellPositionByPixels()
      return hook(50, 20);
    });

    expect(hook.result.current).toStrictEqual({
      x: 0,
      y: 1,
    })

    hook = renderHook(() => {
      const hook = useCalculateCellPositionByPixels()
      return hook(60, 20);
    });

    expect(hook.result.current).toStrictEqual({
      x: 1,
      y: 1,
    })
  })
})
