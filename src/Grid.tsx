import React, { forwardRef, MutableRefObject } from 'react';
import PanZoom from '@sasza/react-panzoom';

import { GridAPI, GridProps } from 'types';
import ElementWrapper from './Element';
import useApi from './hooks/useApi';
import useApiLoaded from './hooks/useApiLoaded';
import useInitElements from './hooks/useInitElements';
import useMeasureElementHeight from './hooks/useMeasureElementHeight';
import { isLengthAuto } from './helpers/isLengthAuto';
import useRefreshOrganizeElements from './hooks/useRefreshOrganizeElements';
import useOnClick from './hooks/useOnClick';
import useWatchElementsHeight from './hooks/useWatchElementsHeight';
import useOnAfterResize from './hooks/useOnAfterResize';
import GridContext from './GridContext';
import { useGrid } from './hooks/useGrid';
import useOnElementMouseUp from './hooks/useOnElementMouseUp';
import useOnElementsChange from './hooks/useOnElementsChange';
import useMemoRef from './hooks/useMemoRef';
import useOnContainerZoomChange from './hooks/useOnContainerZoomChange';
import { useSortedElements } from './hooks/useSortedElements';
import { HeightProvider, useGridHeight } from './HeightContext';
import Lines from './Lines';
import Styles from './Styles';

const Grid: React.FC<React.PropsWithChildren> = ({ children }) => {
  const {
    boundary,
    cols,
    colWidth,
    disabledMove,
    disabledScrollHorizontal,
    disabledScrollVertical,
    disabledZoom,
    elementsNodes,
    elementResizerWidth,
    gapHorizontal,
    gapVertical,
    gridRef,
    helpLines,
    internalWidth,
    isMousePressed,
    rowHeight,
    onContainerContextMenu,
    onContainerChange,
    onElementContextMenu,
    onElementStartResizing,
    paddingLeft,
    panZoomRef,
    selectedElements,
    scrollSpeed,
    zoomInitial,
    zoomMax,
    zoomMin,
    zoomSpeed,
  } = useGrid();
  const height = useGridHeight();

  useInitElements();
  useWatchElementsHeight();
  useApi();

  const apiLoaded = useApiLoaded();
  const measureElementHeight = useMeasureElementHeight();
  const measureElementHeightMemo = useMemoRef(measureElementHeight);

  const onClick = useOnClick();
  const onClickMemo = useMemoRef(onClick);

  const onAfterResize = useOnAfterResize();
  const onAfterResizeMemo = useMemoRef(onAfterResize);
  const onElementStartResizingMemo = useMemoRef(onElementStartResizing);

  const onElementMouseUp = useOnElementMouseUp();
  const onElementMouseUpMemo = useMemoRef(onElementMouseUp);

  const onContainerContextMenuMemo = useMemoRef(onContainerContextMenu);
  const onElementContextMenuMemo = useMemoRef(onElementContextMenu);
  const onElementsChange = useOnElementsChange();
  const onContainerZoomChange = useOnContainerZoomChange();

  const sortedElements = useSortedElements();

  useRefreshOrganizeElements();

  const elementProps = {
    cols,
    elementsNodes: elementsNodes.current,
    rowHeight,
    colWidth,
    gapHorizontal,
    gapVertical,
    measureElementHeight: measureElementHeightMemo,
    paddingLeft,
  };

  return (
    <div className="react-grid-panzoom" ref={gridRef}>
      <Styles />
      <PanZoom
        boundary={boundary}
        onElementsChange={onElementsChange}
        width={isLengthAuto(internalWidth) ? '100%' : internalWidth}
        height={height}
        ref={panZoomRef}
        disabledScrollHorizontal={disabledScrollHorizontal}
        disabledScrollVertical={disabledScrollVertical}
        disabledMove={disabledMove}
        disabledZoom={disabledZoom}
        onContainerChange={onContainerChange}
        onContextMenu={onContainerContextMenuMemo}
        onContainerZoomChange={onContainerZoomChange}
        scrollSpeed={scrollSpeed}
        zoomInitial={zoomInitial}
        zoomMax={zoomMax}
        zoomMin={zoomMin}
        zoomSpeed={zoomSpeed}
      >
        {children && (
          <div style={{
            width: '100%', height: '100%', top: 0, left: 0, position: 'absolute',
          }}
          >
            {children}
          </div>
        )}
        <div
          style={{
            width: '100%', height: '100%', top: 0, left: 0, position: 'absolute',
          }}
        >
          {
            apiLoaded && isMousePressed && selectedElements.map((element) => (
              <ElementWrapper
                key={`dest-${element.id}`}
                id={`dest-${element.id}`}
                element={element}
                opacity="0.1"
                disabled
                isShadow
                fullHeight={element.fullHeight}
                {...elementProps}
              />
            ))
          }
        </div>
        { apiLoaded && helpLines && isMousePressed && <Lines /> }
        {
          apiLoaded && sortedElements.map((element) => !!element.id && (
            <ElementWrapper
              key={element.id}
              id={element.id}
              element={element}
              elementResizerWidth={elementResizerWidth}
              onAfterResize={onAfterResizeMemo}
              onClick={onClickMemo}
              onContextMenu={onElementContextMenuMemo}
              onMouseUp={onElementMouseUpMemo}
              onStartResizing={onElementStartResizingMemo}
              disabled={element.disabled}
              fullHeight={element.fullHeight}
              {...elementProps}
            />
          ))
        }
      </PanZoom>
    </div>
  );
};

Grid.displayName = 'Grid';

const GridWithRef = forwardRef(
  (props: Omit<GridProps, 'forwardRef'>, ref: MutableRefObject<GridAPI>) => (
    <GridContext {...props} forwardRef={ref}>
      <HeightProvider>
        <Grid>{props.children}</Grid>
      </HeightProvider>
    </GridContext>
  ),
);

GridWithRef.displayName = 'GridWithRef';

export default GridWithRef;
