import { createContext, MutableRefObject, useContext } from 'react';
import { API } from '@sasza/react-panzoom';

import { GridAPI, GridElement, GridProps } from 'types';

export type IGridContext = {
  colWidth: number | 'auto',
  gridRef: MutableRefObject<HTMLDivElement>,
  hasCollision: MutableRefObject<boolean>,
  isMousePressed: boolean,
  panZoomRef: MutableRefObject<API>,
  currentElements: MutableRefObject<GridElement[]>,
  selectedElements: GridElement[],
  setSelectedElements: (elements: GridElement[]) => void,
  elementRef: MutableRefObject<HTMLDivElement>,
  elementsNodes: MutableRefObject<Record<string | number, HTMLDivElement>>,
  elementsHeightRef: MutableRefObject<Record<string | number, number>>,
  elementResizerWidth?: number,
  forwardRef: MutableRefObject<GridAPI>,
  internalWidth: number | 'auto',
  onElementsMeasureUpdateRef: MutableRefObject<GridProps['onElementsMeasureUpdate']>,
} & Omit<GridProps, 'ref'>

export const GridContext = createContext({} as IGridContext);

export const useGrid = (): IGridContext => {
  const grid = useContext(GridContext);
  return grid;
};
