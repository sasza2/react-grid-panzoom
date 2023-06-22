import React, {
  createContext, useContext, useMemo,
} from 'react';

import useMeasureElementHeight from './hooks/useMeasureElementHeight';
import { useGrid } from './hooks/useGrid';
import getGridBottomInPixels from './helpers/getGridBottomInPixels';

const HeightContext = createContext<number>(0);

export const useGridHeight = () => {
  const height = useContext(HeightContext);
  return height;
};

export const HeightProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const {
    elements, gapVertical, rows, rowHeight,
  } = useGrid();

  const measureElementHeight = useMeasureElementHeight();

  const internalHeight = useMemo(
    () => getGridBottomInPixels({
      elements,
      gapVertical,
      measureElementHeight,
      rows,
      rowHeight,
    }),
    [elements, gapVertical, measureElementHeight, rows, rowHeight],
  );

  return (
    <HeightContext.Provider value={internalHeight}>
      {children}
    </HeightContext.Provider>
  );
};
