import { useCallback } from 'react';

import { Pixels, Position } from 'types';
import { isLengthAuto } from '@/helpers/isLengthAuto';
import { useGridHeight } from '@/HeightContext';
import { useGrid } from './useGrid';

const useCalculateCellPositionByPixels = () => {
  const {
    cols,
    colWidth,
    gapHorizontal,
    gapVertical,
    internalWidth,
    paddingLeft,
    rowHeight,
    rows,
  } = useGrid();
  const height = useGridHeight();

  const calculateCellPositionByPixels = useCallback((x: Pixels, y: Pixels): Position => {
    const yPos = Math.floor((y + y + rowHeight + gapVertical) / 2 / (rowHeight + gapVertical));
    if (isLengthAuto(colWidth)) return { x: 0, y: yPos };

    const xWithoutPadding = x - paddingLeft;
    let gridX = Math.floor(
      ((xWithoutPadding * 2 + colWidth + gapHorizontal) / 2) / (colWidth + gapHorizontal),
    );

    if (gridX < 0) gridX = 0;
    else if (gridX > cols) gridX = cols - 1;

    return {
      x: gridX,
      y: Math.max(yPos, 0),
    };
  }, [cols, colWidth, gapHorizontal, gapVertical, height, internalWidth, rowHeight, rows]);

  return calculateCellPositionByPixels;
};

export default useCalculateCellPositionByPixels;
