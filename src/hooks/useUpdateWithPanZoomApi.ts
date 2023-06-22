import { GridElement } from 'types';
import calculatePixelsByCellPosition from '@/helpers/calculatePixelsByCellPosition';
import { useGrid } from './useGrid';

const useUpdateWithPanZoomApi = () => {
  const {
    colWidth,
    gapHorizontal,
    gapVertical,
    paddingLeft,
    panZoomRef,
    rowHeight,
  } = useGrid();
  const updateWithPanZoomApi = (element: GridElement) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const nextPosition = calculatePixelsByCellPosition(element, {
      gapHorizontal, gapVertical, paddingLeft, colWidth, rowHeight,
    });

    const elements = panZoomRef.current.getElements();
    const elementInPanZoom = elements[element.id];
    if (!elementInPanZoom) return;

    if (elementInPanZoom.position.x === nextPosition.x
      && elementInPanZoom.position.y === nextPosition.y) {
      return;
    }

    panZoomRef.current.updateElementPositionSilent(element.id, nextPosition);
  };

  return updateWithPanZoomApi;
};

export default useUpdateWithPanZoomApi;
