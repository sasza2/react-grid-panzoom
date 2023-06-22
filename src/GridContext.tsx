import React, { useMemo, useRef, useState } from 'react';
import { API } from '@sasza/react-panzoom';

import {
  GridAPI, GridElement, GridProps, Pixels,
} from 'types';
import { isLengthAuto } from './helpers/isLengthAuto';
import useInternalWidth from './hooks/useInternalWidth';
import { GridContext, IGridContext } from './hooks/useGrid';
import useIsMousePressed from './hooks/useIsMousePressed';
import { defaultOrganizeGridElements } from './helpers/organizeGridElements';

type GridProviderProps = React.PropsWithChildren<GridProps & {
  forwardRef?: React.MutableRefObject<GridAPI>,
}>

const GridProvider: React.FC<GridProviderProps> = ({
  children,
  cols,
  elements = [],
  forwardRef,
  onElementsMeasureUpdate,
  organizeGridElements = defaultOrganizeGridElements,
  gapHorizontal = 0,
  gapVertical = 0,
  paddingLeft = 0,
  paddingRight = 0,
  rows,
  rowHeight,
  width,
  ...props
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const internalWidth = useInternalWidth(width, gridRef);
  const colWidth: Pixels | 'auto' = isLengthAuto(internalWidth)
    ? 'auto'
    : (internalWidth - (cols - 1) * gapHorizontal - paddingLeft - paddingRight) / cols;
  const hasCollision = useRef<boolean>(false);
  const panZoomRef = useRef<API>();
  const currentElements = useRef<Array<GridElement>>([]);
  const elementRef = useRef<HTMLDivElement>();
  const elementsNodes = useRef<Record<string | number, HTMLDivElement>>({});
  const elementsHeightRef = useRef<Record<string | number, number>>({});
  const onElementsMeasureUpdateRef = useRef<typeof onElementsMeasureUpdate>();
  onElementsMeasureUpdateRef.current = onElementsMeasureUpdate;
  const [selectedElements, setSelectedElements] = useState<GridElement[]>([]);
  const isMousePressed = useIsMousePressed();

  const selectedElementsWithoutRemoved = useMemo<GridElement[]>(() => {
    if (!selectedElements) return selectedElements;

    const elementsGroup = elements.reduce((map, element) => {
      map[element.id] = element;
      return map;
    }, {} as Record<string | number, GridElement>);

    return selectedElements.filter((element) => elementsGroup[element.id]);
  }, [elements, selectedElements]);

  const value: Omit<IGridContext, 'ref'> = {
    ...props,
    cols,
    colWidth,
    elements,
    gapHorizontal,
    gapVertical,
    internalWidth,
    isMousePressed,
    paddingLeft,
    paddingRight,
    gridRef,
    hasCollision,
    panZoomRef,
    currentElements,
    selectedElements: selectedElementsWithoutRemoved,
    setSelectedElements,
    elementRef,
    elementsNodes,
    elementsHeightRef,
    forwardRef,
    organizeGridElements,
    onElementsMeasureUpdate,
    onElementsMeasureUpdateRef,
    rows,
    rowHeight,
    width,
  };

  return (
    <GridContext.Provider value={value}>
      {children}
    </GridContext.Provider>
  );
};

export default GridProvider;
